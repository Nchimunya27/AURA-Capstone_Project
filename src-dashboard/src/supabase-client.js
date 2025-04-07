// Initialize Supabase client
const SUPABASE_URL = 'https://uumdfsnboqkounadxijq.supabase.co'; // Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0'; //  Supabase anon key

// single supabase client for interacting with your database
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
  // Enhanced document upload method
  uploadDocument: async (file, courseId = null, description = '') => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user.id;
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Create unique file path
      const filePath = courseId 
        ? `${userId}/${courseId}/${safeFileName}_${timestamp}.${fileExtension}`
        : `${userId}/${safeFileName}_${timestamp}.${fileExtension}`;
      
      // Prepare metadata
      const metadata = {
        size: file.size,
        mimetype: file.type,
        lastModified: file.lastModified,
        uploadTimestamp: new Date().toISOString()
      };
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: metadata
        });
      
      if (storageError) throw storageError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // If this is a note (text file), extract content
      let content = null;
      if (file.type === 'text/plain') {
        content = await file.text();
      }
      
      // Save document metadata
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          bucket_id: 'documents',
          file_size: file.size,
          mime_type: file.type,
          description: description || '',
          content: content,
          is_note: file.type === 'text/plain',
          course_id: courseId,
          storage_metadata: metadata
        })
        .select()
        .single();
      
      if (documentError) throw documentError;
      
      return { 
        success: true, 
        document: {
          ...documentData,
          publicUrl: urlData?.publicUrl
        }
      };
    } catch (error) {
      console.error('Complete document upload error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  debugUpload: async (file, courseId = null, description = '') => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user.id;
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Create unique file path
      const filePath = courseId 
        ? `${userId}/${courseId}/${safeFileName}_${timestamp}.${fileExtension}`
        : `${userId}/${safeFileName}_${timestamp}.${fileExtension}`;
      
      // Prepare comprehensive metadata
      const metadata = {
        size: file.size.toString(), // Convert to string to ensure compatibility
        mimetype: file.type,
        lastModified: file.lastModified.toString(),
        filename: file.name,
        uploadTimestamp: new Date().toISOString()
      };
      
      console.log("Uploading file with metadata:", metadata);
      
      // Upload file to storage with explicit metadata formatting
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: metadata
        });
      
      if (storageError) {
        console.error("Storage error:", storageError);
        throw storageError;
      }
      
      console.log("File uploaded successfully to storage:", storageData);
      
      // Wait briefly to give trigger time to run
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if document was created by the trigger
      const { data: checkData, error: checkError } = await supabase
        .from('documents')
        .select('*')
        .eq('file_path', filePath)
        .limit(1);
      
      if (checkError) {
        console.error("Error checking for document:", checkError);
      }
      
      console.log("Document check result:", checkData);
      
      // If the trigger didn't create the document, create it manually
      if (!checkData || checkData.length === 0) {
        console.log("Trigger did not create document record. Creating manually...");
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        // If this is a note (text file), extract content
        let content = null;
        if (file.type === 'text/plain') {
          content = await file.text();
        }
        
        // Save document metadata manually
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            filename: file.name,
            file_path: filePath,
            bucket_id: 'documents',
            file_size: file.size,
            mime_type: file.type,
            description: description || '',
            content: content,
            is_note: file.type === 'text/plain',
            course_id: courseId,
            storage_metadata: metadata // Save the metadata we created
          })
          .select()
          .single();
        
        if (documentError) {
          console.error("Error creating document record:", documentError);
          throw documentError;
        }
        
        console.log("Document record created manually:", documentData);
        
        return { 
          success: true, 
          document: {
            ...documentData,
            publicUrl: urlData?.publicUrl,
            fromTrigger: false
          }
        };
      }
      
      // Return the document created by the trigger
      return { 
        success: true, 
        document: {
          ...checkData[0],
          publicUrl: supabase.storage.from('documents').getPublicUrl(filePath).data?.publicUrl,
          fromTrigger: true
        }
      };
    } catch (error) {
      console.error('Complete document upload error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },




  // Method to save notes directly
  saveNote: async (noteContent, tags = [], courseId = null) => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user.id;
      const timestamp = new Date().toISOString();
      const safeFileName = `Note_${timestamp.slice(0, 10)}.txt`;
      
      // Prepare file path
      const filePath = courseId 
        ? `${userId}/${courseId}/${safeFileName}`
        : `${userId}/${safeFileName}`;
      
      // Prepare metadata
      const metadata = {
        size: noteContent.length,
        mimetype: 'text/plain',
        uploadTimestamp: timestamp
      };
      
      // Upload note content as a text file
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, new Blob([noteContent], {type: 'text/plain'}), {
          contentType: 'text/plain',
          metadata: metadata
        });
      
      if (storageError) throw storageError;
      
      // Save document metadata
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: safeFileName,
          file_path: filePath,
          bucket_id: 'documents',
          file_size: noteContent.length,
          mime_type: 'text/plain',
          description: noteContent.slice(0, 100), // First 100 chars as description
          content: noteContent,
          tags: tags,
          is_note: true,
          course_id: courseId,
          storage_metadata: metadata
        })
        .select()
        .single();
      
      if (documentError) throw documentError;
      
      return { 
        success: true, 
        note: documentData 
      };
    } catch (error) {
      console.error('Error saving note:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Method to retrieve notes
  getNotes: async (tags = [], courseId = null) => {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_note', true)
        .order('created_at', { ascending: false });
      
      // Optional: filter by tags if provided
      if (tags.length > 0) {
        query = query.contains('tags', tags);
      }
      
      // Optional: filter by course ID
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { 
        success: true, 
        notes: data 
      };
    } catch (error) {
      console.error('Error retrieving notes:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Method to update a note
  updateNote: async (noteId, updatedContent, tags = []) => {
    try {
      // Get current user for verification
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Update note content and metadata
      const { data, error } = await supabase
        .from('documents')
        .update({
          content: updatedContent,
          tags: tags,
          description: updatedContent.slice(0, 100),
          updated_at: new Date().toISOString(),
          file_size: updatedContent.length
        })
        .eq('id', noteId)
        .eq('is_note', true)
        .eq('user_id', userData.user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Also update the file in storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .update(data.file_path, new Blob([updatedContent], {type: 'text/plain'}), {
          contentType: 'text/plain'
        });
      
      if (storageError) throw storageError;
      
      return { 
        success: true, 
        note: data 
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Method to delete a note
  deleteNote: async (noteId) => {
    try {
      // Get note details first to get file path
      const { data: noteData, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', noteId)
        .eq('is_note', true)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([noteData.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete from documents table
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', noteId)
        .eq('is_note', true);
      
      if (dbError) throw dbError;
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { 
        success: false, 
        error: error.message 
      };
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
        query = query.eq('course_id', courseId);
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