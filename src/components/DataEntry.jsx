// src/components/DataEntry.jsx
import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadString } from 'firebase/storage';
import firestore from '../firebase';

const DataEntry = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    problem: '',
    treatment: '',
    documents: [],  // Change to an array to store multiple files
    dateAndTime: '',
    location: '',
    doctorInfo: '',
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setUserId(auth.currentUser?.uid || null);
  }, []);

  const handleDataEntry = async () => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    try {
      // Create or update the 'users' document with the same ID as the user
      const usersCollection = collection(firestore, 'users');
      const userDocRef = doc(usersCollection, userId);
      // Create a subcollection 'dataEntries' within the 'users' document
      const dataEntriesCollection = collection(userDocRef, 'dataEntries');

      // Add a new document to the 'dataEntries' subcollection
      const newDocRef = await addDoc(dataEntriesCollection, {
        timestamp: serverTimestamp(),
        ...formData,
      });

      // Upload the documents to Firebase Storage
      if (formData.documents.length > 0) {
        const storage = getStorage();
        const userFolderRef = ref(storage, `userDocuments/${userId}`);

        await Promise.all(formData.documents.map(async (file, index) => {
          const documentRef = ref(userFolderRef, `${newDocRef.id}/${file.name}`);
          await uploadString(documentRef, file.content, 'data_url');
        }));
      }

      // Clear the form after submission
      setFormData({
        title: '',
        category: '',
        problem: '',
        treatment: '',
        documents: [],
        dateAndTime: '',
        location: '',
        doctorInfo: '',
      });

      console.log('Data entry added successfully!');
    } catch (error) {
      console.error('Error adding data entry:', error);
    }
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const readerPromises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              content: reader.result,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises).then((documents) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          documents,
        }));
      });
    }
  };

  return (
    <div>
      <h1>Data Entry</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleDataEntry(); }}>
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </label>
        <br />
        <label>
          Category:
          <input type="text" name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
        </label>
        <br />
        <label>
          Problem:
          <textarea name="problem" value={formData.problem} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} />
        </label>
        <br />
        <label>
          Treatment:
          <textarea name="treatment" value={formData.treatment} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })} />
        </label>
        <br />
        <label>
          Document Upload:
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleDocumentUpload} multiple />
        </label>
        <br />
        <label>
          Date and Time:
          <input type="text" name="dateAndTime" value={formData.dateAndTime} onChange={(e) => setFormData({ ...formData, dateAndTime: e.target.value })} />
        </label>
        <br />
        <label>
          Location:
          <input type="text" name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
        </label>
        <br />
        <label>
          Doctor Info:
          <input type="text" name="doctorInfo" value={formData.doctorInfo} onChange={(e) => setFormData({ ...formData, doctorInfo: e.target.value })} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DataEntry;