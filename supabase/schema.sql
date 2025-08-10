-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE exercise_category AS ENUM ('strength', 'cardio', 'flexibility');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table (predefined exercises)
CREATE TABLE public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category exercise_category NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout templates table
CREATE TABLE public.workout_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises table (junction table)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  target_sets INTEGER NOT NULL CHECK (target_sets > 0),
  target_reps INTEGER NOT NULL CHECK (target_reps > 0),
  target_weight DECIMAL(6,2),
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sessions table
CREATE TABLE public.workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sets table
CREATE TABLE public.workout_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  actual_reps INTEGER NOT NULL CHECK (actual_reps >= 0),
  actual_weight DECIMAL(6,2),
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workout_templates_user_id ON public.workout_templates(user_id);
CREATE INDEX idx_workout_exercises_template_id ON public.workout_exercises(workout_template_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_template_id ON public.workout_sessions(workout_template_id);
CREATE INDEX idx_workout_sets_session_id ON public.workout_sets(workout_session_id);
CREATE INDEX idx_workout_sets_exercise_id ON public.workout_sets(workout_exercise_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Exercises are readable by all authenticated users
CREATE POLICY "Authenticated users can view exercises" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Workout templates
CREATE POLICY "Users can view own workout templates" ON public.workout_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout templates" ON public.workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout templates" ON public.workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout templates" ON public.workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises
CREATE POLICY "Users can view workout exercises for own templates" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_templates 
      WHERE id = workout_template_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workout exercises for own templates" ON public.workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_templates 
      WHERE id = workout_template_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workout exercises for own templates" ON public.workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workout_templates 
      WHERE id = workout_template_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workout exercises for own templates" ON public.workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workout_templates 
      WHERE id = workout_template_id AND user_id = auth.uid()
    )
  );

-- Workout sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Workout sets
CREATE POLICY "Users can view workout sets for own sessions" ON public.workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = workout_session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workout sets for own sessions" ON public.workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = workout_session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workout sets for own sessions" ON public.workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = workout_session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workout sets for own sessions" ON public.workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = workout_session_id AND user_id = auth.uid()
    )
  );

-- Functions and triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sets_updated_at BEFORE UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default exercises
INSERT INTO public.exercises (name, category, muscle_groups, equipment, instructions) VALUES
('Bench Press', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'barbell', 'Lie on bench, lower bar to chest, press up'),
('Squat', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'barbell', 'Bar on shoulders, squat down, stand up'),
('Deadlift', 'strength', ARRAY['back', 'hamstrings', 'glutes'], 'barbell', 'Stand with bar, lift by extending hips and knees'),
('Pull-up', 'strength', ARRAY['back', 'biceps'], 'pull-up bar', 'Hang from bar, pull body up until chin over bar'),
('Push-up', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', 'Plank position, lower body, push up'),
('Overhead Press', 'strength', ARRAY['shoulders', 'triceps'], 'barbell', 'Stand with bar at shoulders, press overhead'),
('Row', 'strength', ARRAY['back', 'biceps'], 'barbell', 'Bend over, pull bar to lower chest'),
('Lunge', 'strength', ARRAY['quadriceps', 'glutes'], 'bodyweight', 'Step forward, lower back knee, return to start'),
('Plank', 'strength', ARRAY['core'], 'bodyweight', 'Hold body in straight line from head to heels'),
('Running', 'cardio', ARRAY['legs', 'cardiovascular'], 'treadmill', 'Run at moderate pace for specified duration'); 