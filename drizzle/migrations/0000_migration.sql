
CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator');
CREATE TYPE public.pub_status AS ENUM ('draft', 'published');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE public.enquiry_status AS ENUM ('new','contacted','awaiting_information','under_review','quotation_ready','follow_up','closed');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_bootstrap AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  slug text NOT NULL,
  kind text NOT NULL DEFAULT 'specialty' CHECK (kind IN ('specialty','blog')),
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, slug)
);

CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL UNIQUE,
  logo_url text, cover_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  overview text,
  country text, city text, address text,
  facilities text[] NOT NULL DEFAULT '{}',
  accreditations jsonb NOT NULL DEFAULT '[]'::jsonb,
  international_services text[] NOT NULL DEFAULT '{}',
  phone text, email text, website text,
  status public.pub_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL UNIQUE,
  photo_url text,
  title text,
  qualifications text[] NOT NULL DEFAULT '{}',
  experience_years int CHECK (experience_years IS NULL OR experience_years BETWEEN 0 AND 80),
  languages text[] NOT NULL DEFAULT '{}',
  profile text,
  consultation_details text,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  status public.pub_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  summary text,
  overview text,
  procedures text[] NOT NULL DEFAULT '{}',
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_from numeric(12,2),
  price_currency text DEFAULT 'USD',
  price_note text,
  show_price boolean NOT NULL DEFAULT false,
  disclaimer text,
  status public.pub_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.hospital_specialties (
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (hospital_id, category_id)
);
CREATE TABLE public.hospital_treatments (
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  PRIMARY KEY (hospital_id, treatment_id)
);
CREATE TABLE public.doctor_hospitals (
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, hospital_id)
);
CREATE TABLE public.doctor_specialties (
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, category_id)
);
CREATE TABLE public.doctor_treatments (
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, treatment_id)
);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 250),
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  featured_image text,
  featured_image_alt text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  author_name text,
  status public.pub_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  seo_title text, seo_description text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.post_treatments (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, treatment_id)
);
CREATE TABLE public.post_hospitals (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hospital_id)
);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 150),
  country text NOT NULL CHECK (char_length(country) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  treatment_interest text CHECK (treatment_interest IS NULL OR char_length(treatment_interest) <= 200),
  treatment_id uuid REFERENCES public.treatments(id) ON DELETE SET NULL,
  message text CHECK (message IS NULL OR char_length(message) <= 3000),
  preferred_contact text NOT NULL DEFAULT 'email' CHECK (preferred_contact IN ('email','phone','whatsapp')),
  consent boolean NOT NULL DEFAULT false,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  assigned_coordinator text,
  internal_notes text,
  next_follow_up date,
  source text NOT NULL DEFAULT 'website',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  alt text,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name text NOT NULL DEFAULT 'MedJourney',
  tagline text,
  contact_email text, contact_phone text, whatsapp text, address text,
  logo_url text,
  footer_note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['categories','hospitals','doctors','treatments','posts','enquiries','media','site_settings'] LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

GRANT SELECT ON public.categories, public.hospitals, public.doctors, public.treatments, public.posts,
  public.hospital_specialties, public.hospital_treatments, public.doctor_hospitals, public.doctor_specialties,
  public.doctor_treatments, public.post_treatments, public.post_hospitals, public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.hospitals, public.doctors, public.treatments, public.posts,
  public.hospital_specialties, public.hospital_treatments, public.doctor_hospitals, public.doctor_specialties,
  public.doctor_treatments, public.post_treatments, public.post_hospitals, public.site_settings,
  public.enquiries, public.media TO authenticated;
GRANT INSERT ON public.enquiries TO anon;
GRANT ALL ON public.categories, public.hospitals, public.doctors, public.treatments, public.posts,
  public.hospital_specialties, public.hospital_treatments, public.doctor_hospitals, public.doctor_specialties,
  public.doctor_treatments, public.post_treatments, public.post_hospitals, public.site_settings,
  public.enquiries, public.media TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read published hospitals" ON public.hospitals FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Public read published doctors" ON public.doctors FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Public read published treatments" ON public.treatments FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT TO anon, authenticated USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['hospital_specialties','hospital_treatments','doctor_hospitals','doctor_specialties','doctor_treatments','post_treatments','post_hospitals'] LOOP
    EXECUTE format('CREATE POLICY "Public read %s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['categories','hospitals','doctors','treatments','posts','hospital_specialties','hospital_treatments','doctor_hospitals','doctor_specialties','doctor_treatments','post_treatments','post_hospitals','media'] LOOP
    EXECUTE format('CREATE POLICY "Staff manage %s" ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t, t);
  END LOOP;
END $$;
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can submit enquiry" ON public.enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (consent = true AND status = 'new' AND assigned_coordinator IS NULL AND internal_notes IS NULL AND next_follow_up IS NULL AND is_sample = false AND source = 'website');
CREATE POLICY "Staff create enquiries" ON public.enquiries FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Staff upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

INSERT INTO public.site_settings (id, site_name, tagline, contact_email, contact_phone, whatsapp, address, footer_note)
VALUES (1, 'MedJourney', 'Guidance for treatment abroad, from first question to follow-up.', 'care@example.com', '+00 000 000 0000', '+00 000 000 0000', 'Placeholder address — update in Admin › Settings', 'Information on this site is general and not a substitute for advice from a qualified medical professional.');

INSERT INTO public.categories (id, name, slug, kind, description, icon, sort_order, is_sample) VALUES
('11111111-0000-0000-0000-000000000001','Cardiology','cardiology','specialty','Heart and vascular care, from diagnostics to surgical procedures.','heart',1,true),
('11111111-0000-0000-0000-000000000002','Orthopedics','orthopedics','specialty','Joint, bone and spine treatments including replacements.','bone',2,true),
('11111111-0000-0000-0000-000000000003','Oncology','oncology','specialty','Cancer evaluation, second opinions and treatment planning.','ribbon',3,true),
('11111111-0000-0000-0000-000000000004','Fertility','fertility','specialty','Assisted reproduction consultations and procedures.','baby',4,true),
('11111111-0000-0000-0000-000000000005','Ophthalmology','ophthalmology','specialty','Vision correction and eye surgery.','eye',5,true),
('11111111-0000-0000-0000-000000000006','Dental Care','dental-care','specialty','Implants, restorations and cosmetic dentistry.','smile',6,true),
('22222222-0000-0000-0000-000000000001','Patient Guides','patient-guides','blog','Practical guides for planning treatment abroad.',NULL,1,true),
('22222222-0000-0000-0000-000000000002','Treatment Explainers','treatment-explainers','blog','Plain-language overviews of common procedures.',NULL,2,true);

INSERT INTO public.hospitals (id,name,slug,cover_url,gallery,overview,country,city,address,facilities,accreditations,international_services,phone,email,website,status,is_featured,is_sample) VALUES
('33333333-0000-0000-0000-000000000001','[DEMO] Harbourview Medical Centre','demo-harbourview-medical-centre','/images/hospital-1.jpg','{/images/hospital-1.jpg,/images/hospital-2.jpg}','Sample listing used to demonstrate the hospital profile layout. Harbourview is a fictional multi-specialty centre with dedicated cardiac and orthopaedic units.','Sampleland','Port City','1 Example Avenue, Port City','{"24/7 emergency","Cardiac catheterisation lab","Physiotherapy unit","Private rooms"}','[{"name":"International accreditation (example)","status":"unverified"}]','{"Airport pickup coordination","Interpreter services","Visa invitation letters","Accommodation guidance"}','+00 111 111 1111','demo@example.com','https://example.com','published',true,true),
('33333333-0000-0000-0000-000000000002','[DEMO] Lakeside University Hospital','demo-lakeside-university-hospital','/images/hospital-2.jpg','{/images/hospital-2.jpg,/images/hospital-3.jpg}','Sample listing. A fictional teaching hospital profile showing how oncology and fertility departments can be presented.','Exampleton','Lake District','22 Sample Road, Lake District','{"Oncology day unit","IVF laboratory","Diagnostic imaging (MRI/CT)"}','[{"name":"National accreditation (example)","status":"pending"}]','{"International patient desk","Interpreter services","Medical record translation"}','+00 222 222 2222','demo@example.com','https://example.com','published',true,true),
('33333333-0000-0000-0000-000000000003','[DEMO] Northgate Eye & Dental Clinic','demo-northgate-eye-dental-clinic','/images/hospital-3.jpg','{/images/hospital-3.jpg}','Sample listing. A fictional specialist clinic profile for ophthalmology and dental care.','Sampleland','Northgate','5 Placeholder Street, Northgate','{"Laser vision suite","Digital dental lab"}','[{"name":"Quality certification (example)","status":"unverified"}]','{"Appointment coordination","Interpreter services"}','+00 333 333 3333','demo@example.com','https://example.com','published',true,true);

INSERT INTO public.treatments (id,name,slug,category_id,summary,overview,procedures,faqs,disclaimer,status,is_sample,seo_title,seo_description) VALUES
('44444444-0000-0000-0000-000000000001','Coronary Artery Bypass Grafting (CABG)','coronary-artery-bypass-grafting','11111111-0000-0000-0000-000000000001','Surgery that improves blood flow to the heart by bypassing narrowed arteries.','CABG is a surgical procedure that uses a blood vessel from another part of the body to bypass blocked coronary arteries. Suitability depends on a full cardiac assessment by a qualified cardiologist and cardiac surgeon.','{"Pre-operative cardiac assessment","On-pump or off-pump bypass","Post-operative cardiac rehabilitation"}','[{"q":"How long is a typical hospital stay?","a":"Stays vary by patient and hospital; your treating team will advise after assessment."},{"q":"Can I travel home soon after?","a":"Fitness to fly is decided by your surgeon. Coordinators can help plan follow-up."}]','This page is general information only and not medical advice. Treatment decisions must be made with qualified medical professionals.','published',true,'CABG Surgery Abroad – Overview & Planning','Learn what coronary artery bypass grafting involves and how to plan an assessment with partner hospitals.'),
('44444444-0000-0000-0000-000000000002','Total Knee Replacement','total-knee-replacement','11111111-0000-0000-0000-000000000002','Replacing a damaged knee joint with an artificial implant.','Total knee replacement may be considered for advanced arthritis or joint damage after conservative treatments. An orthopaedic surgeon will review imaging and your medical history.','{"Orthopaedic consultation and imaging review","Knee arthroplasty","Inpatient physiotherapy"}','[{"q":"When can I walk after surgery?","a":"Many patients begin assisted walking early, but recovery plans are individual."}]','This page is general information only and not medical advice.','published',true,NULL,NULL),
('44444444-0000-0000-0000-000000000003','Oncology Second Opinion','oncology-second-opinion','11111111-0000-0000-0000-000000000003','An independent specialist review of a cancer diagnosis and treatment plan.','A second opinion involves a specialist reviewing existing reports, imaging and pathology. It can help you understand options. Reports are only requested after you speak with a coordinator.','{"Report review","Multidisciplinary tumour board review (where offered)","Written summary of options"}','[]','This page is general information only and not medical advice.','published',true,NULL,NULL),
('44444444-0000-0000-0000-000000000004','IVF Treatment','ivf-treatment','11111111-0000-0000-0000-000000000004','In vitro fertilisation consultations and treatment cycles.','IVF involves ovarian stimulation, egg retrieval, fertilisation in a laboratory and embryo transfer. Outcomes vary significantly between individuals.','{"Fertility assessment","Ovarian stimulation","Egg retrieval and embryo transfer"}','[]','This page is general information only and not medical advice.','published',true,NULL,NULL),
('44444444-0000-0000-0000-000000000005','LASIK Eye Surgery','lasik-eye-surgery','11111111-0000-0000-0000-000000000005','Laser vision correction for certain refractive errors.','LASIK reshapes the cornea to correct refractive errors. Candidacy depends on a detailed eye examination.','{"Corneal topography","LASIK procedure","Post-operative check-ups"}','[]','This page is general information only and not medical advice.','published',true,NULL,NULL),
('44444444-0000-0000-0000-000000000006','Dental Implants','dental-implants','11111111-0000-0000-0000-000000000006','Replacing missing teeth with titanium implant posts and crowns.','Dental implants are typically placed in stages over several months. A dentist will assess bone density and oral health.','{"CBCT scan","Implant placement","Crown fitting"}','[]','This page is general information only and not medical advice.','published',true,NULL,NULL);

INSERT INTO public.hospital_specialties VALUES
('33333333-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000003'),
('33333333-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000004'),
('33333333-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000005'),
('33333333-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000006');
INSERT INTO public.hospital_treatments VALUES
('33333333-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000002','44444444-0000-0000-0000-000000000003'),
('33333333-0000-0000-0000-000000000002','44444444-0000-0000-0000-000000000004'),
('33333333-0000-0000-0000-000000000003','44444444-0000-0000-0000-000000000005'),
('33333333-0000-0000-0000-000000000003','44444444-0000-0000-0000-000000000006');

INSERT INTO public.doctors (id,name,slug,title,qualifications,experience_years,languages,profile,consultation_details,verification_status,status,is_featured,is_sample) VALUES
('55555555-0000-0000-0000-000000000001','[DEMO] Dr. Alex Morgan','demo-dr-alex-morgan','Consultant Cardiac Surgeon','{"MBBS (example)","MS General Surgery (example)"}',15,'{English,Arabic}','Fictional sample profile used to demonstrate the doctor page layout. Not a real practitioner.','Video consultation can be arranged through our coordinators.','unverified','published',true,true),
('55555555-0000-0000-0000-000000000002','[DEMO] Dr. Priya Raman','demo-dr-priya-raman','Orthopaedic Surgeon','{"MBBS (example)","MS Orthopaedics (example)"}',12,'{English,Hindi}','Fictional sample profile. Not a real practitioner.','In-person and video consultations by arrangement.','unverified','published',true,true),
('55555555-0000-0000-0000-000000000003','[DEMO] Dr. Samuel Okafor','demo-dr-samuel-okafor','Medical Oncologist','{"MD (example)"}',18,'{English,French}','Fictional sample profile. Not a real practitioner.','Report reviews available on request.','pending','published',true,true),
('55555555-0000-0000-0000-000000000004','[DEMO] Dr. Lena Fischer','demo-dr-lena-fischer','Ophthalmologist','{"MD (example)","FRCS Ophth (example)"}',10,'{English,German}','Fictional sample profile. Not a real practitioner.','Consultations by arrangement.','unverified','published',true,true);
INSERT INTO public.doctor_hospitals VALUES
('55555555-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001'),
('55555555-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000001'),
('55555555-0000-0000-0000-000000000003','33333333-0000-0000-0000-000000000002'),
('55555555-0000-0000-0000-000000000004','33333333-0000-0000-0000-000000000003');
INSERT INTO public.doctor_specialties VALUES
('55555555-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001'),
('55555555-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002'),
('55555555-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003'),
('55555555-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000005');
INSERT INTO public.doctor_treatments VALUES
('55555555-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000001'),
('55555555-0000-0000-0000-000000000002','44444444-0000-0000-0000-000000000002'),
('55555555-0000-0000-0000-000000000003','44444444-0000-0000-0000-000000000003'),
('55555555-0000-0000-0000-000000000004','44444444-0000-0000-0000-000000000005');

INSERT INTO public.posts (id,title,slug,excerpt,content,featured_image,featured_image_alt,category_id,tags,author_name,status,published_at,is_sample) VALUES
('66666666-0000-0000-0000-000000000001','How to Prepare for Medical Treatment Abroad','how-to-prepare-for-medical-treatment-abroad','A practical checklist for planning treatment in another country — documents, questions to ask, and travel logistics.',E'Planning treatment abroad involves more than choosing a hospital. This sample article outlines the main steps.\n\n## Gather the right information\n\nStart with a clear summary of your diagnosis from your local doctor. You do not need to send full records with an initial enquiry — a coordinator will tell you what is needed.\n\n## Questions to ask a hospital\n\n- Which specialist will treat me?\n- What does the estimate include and exclude?\n- What follow-up care is available after I return home?\n\n## Travel and recovery\n\nAsk your treating team about fitness to fly and expected recovery time before booking travel.\n\n## Next steps\n\nIf you are exploring [Total Knee Replacement](/treatments/total-knee-replacement) or other procedures, you can request an estimate and a coordinator will respond.','/images/blog-1.jpg','Traveller with passport and medical folder at an airport window','22222222-0000-0000-0000-000000000001','{planning,travel}','MedJourney Editorial (sample)','published', now() - interval '3 days', true),
('66666666-0000-0000-0000-000000000002','Understanding Second Opinions in Cancer Care','understanding-second-opinions-in-cancer-care','What a second opinion is, when patients seek one, and what to expect from the process.',E'A second opinion is an independent review of a diagnosis or treatment plan. This is a sample article.\n\n## Why patients seek one\n\nPatients may want reassurance, more information about options, or access to specialised expertise.\n\n## What is reviewed\n\nTypically pathology reports, imaging and the proposed plan. Only share records after speaking with a coordinator through a secure channel.\n\n## Important note\n\nA second opinion does not replace your treating team; it adds perspective.','/images/blog-2.jpg','Doctor reviewing medical scans on a screen','22222222-0000-0000-0000-000000000002','{oncology}','MedJourney Editorial (sample)','published', now() - interval '1 day', true),
('66666666-0000-0000-0000-000000000003','Draft: Recovery Tips After Joint Replacement','recovery-tips-after-joint-replacement','Sample draft post — not visible publicly.',E'## Draft\n\nThis is a draft sample post used to demonstrate the publishing workflow.','/images/blog-3.jpg','Physiotherapist assisting a patient','22222222-0000-0000-0000-000000000002','{orthopedics}','MedJourney Editorial (sample)','draft', NULL, true);
INSERT INTO public.post_treatments VALUES ('66666666-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000002'),('66666666-0000-0000-0000-000000000002','44444444-0000-0000-0000-000000000003');
INSERT INTO public.post_hospitals VALUES ('66666666-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000002');

INSERT INTO public.enquiries (full_name,country,email,phone,treatment_interest,treatment_id,message,preferred_contact,consent,status,assigned_coordinator,internal_notes,next_follow_up,source,is_sample) VALUES
('[SAMPLE] Test Patient One','Sampleland','sample1@example.com','+00 100 000 0001','Total Knee Replacement','44444444-0000-0000-0000-000000000002','Sample enquiry for testing the admin workflow.','email',true,'new',NULL,NULL,NULL,'sample',true),
('[SAMPLE] Test Patient Two','Exampleton','sample2@example.com','+00 100 000 0002','IVF Treatment','44444444-0000-0000-0000-000000000004','Sample enquiry — not a real person.','whatsapp',true,'contacted','Coordinator A','Sample note.', current_date + 3,'sample',true);
