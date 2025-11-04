-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'multiple_choice', 'single_choice', 'rating', 'boolean')) NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ip_address INET
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON public.surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON public.questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(survey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON public.responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON public.responses(submitted_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Surveys policies
CREATE POLICY "Anyone can view active surveys" ON public.surveys
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own surveys" ON public.surveys
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own surveys" ON public.surveys
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own surveys" ON public.surveys
  FOR DELETE USING (auth.uid() = created_by);

-- Questions policies
CREATE POLICY "Anyone can view questions for active surveys" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = questions.survey_id 
      AND surveys.is_active = true
    )
  );

CREATE POLICY "Survey owners can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = questions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Responses policies
CREATE POLICY "Anyone can submit responses to active surveys" ON public.responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = responses.survey_id 
      AND surveys.is_active = true
    )
  );

CREATE POLICY "Survey owners can view responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = responses.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Function to handle user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();