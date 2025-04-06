// Initialize Supabase client
const SUPABASE_URL = 'https://uumdfsnboqkounadxijq.supabase.co'; // Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0'; //  Supabase anon key

// Create a single supabase client for interacting with your database
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Functions
const auth = {
  // Sign up a new user
  signUp: async (email, password, fullName, username) => {
    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username,
            full_name: fullName,
            email,
          },
        ]);

      if (profileError) throw profileError;

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Log in an existing user
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('Error signing in:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get the current user
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error getting user:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get the current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Error getting session:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Document Functions
const documents = {
  // Upload a document to Supabase Storage and save metadata to the documents table
  uploadDocument: async (file, courseId = 'web-development-intro', description = '') => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user.id;
      
      // Create a unique file path: userId/courseId/filename_timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = `${userId}/${courseId}/${safeFileName}_${timestamp}.${fileExtension}`;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (storageError) throw storageError;
      
      // Save metadata to documents table
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: userId,
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            description: description
          }
        ])
        .select()
        .single();
        
      if (documentError) throw documentError;
      
      // Return the document data
      return { 
        success: true, 
        document: {
          ...documentData,
          url: `${SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`
        }
      };
    } catch (error) {
      console.error('Error uploading document:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get all documents for the current user
  getUserDocuments: async (courseId = null) => {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If courseId is provided, filter by courseId
      if (courseId) {
        query = query.ilike('file_path', `%/${courseId}/%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Enhance data with download URLs
      const documentsWithUrls = data.map(doc => ({
        ...doc,
        url: `${SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`
      }));
      
      return { success: true, documents: documentsWithUrls };
    } catch (error) {
      console.error('Error getting documents:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get a signed URL for downloading a document
  getDocumentUrl: async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60); // URL expires in 60 seconds
      
      if (error) throw error;
      
      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Error getting document URL:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Delete a document
  deleteDocument: async (documentId) => {
    try {
      // First get the file path
      const { data: documentData, error: getError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (getError) throw getError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentData.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Flashcard Functions
const flashcards = {
  // Save flashcards for a document
  saveFlashcards: async (documentId, flashcardData) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Insert flashcards
      const { data, error } = await supabase
        .from('flashcards')
        .insert(
          flashcardData.map(card => ({
            user_id: userData.user.id,
            document_id: documentId,
            front: card.front,
            back: card.back,
            status: 'new'
          }))
        );
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error saving flashcards:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get flashcards for a document
  getFlashcards: async (documentId = null) => {
    try {
      let query = supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { success: true, flashcards: data };
    } catch (error) {
      console.error('Error getting flashcards:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Update flashcard status
  updateFlashcardStatus: async (flashcardId, status) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update({ status })
        .eq('id', flashcardId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating flashcard status:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Task Functions
const tasks = {
  // Save a task
  saveTask: async (taskText, courseId = 'web-development-intro', completed = false) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: userData.user.id,
            course_id: courseId,
            text: taskText,
            completed: completed
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, task: data };
    } catch (error) {
      console.error('Error saving task:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get tasks for a course
  getTasks: async (courseId = 'web-development-intro') => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return { success: true, tasks: data };
    } catch (error) {
      console.error('Error getting tasks:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Update task status
  updateTaskStatus: async (taskId, completed) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, task: data };
    } catch (error) {
      console.error('Error updating task status:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Export the modules
window.supabaseClient = {
  auth,
  documents,
  flashcards,
  tasks
};