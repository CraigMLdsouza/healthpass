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
    document: null,
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

      // Upload the document to Firebase Storage
      if (formData.document) {
        const storage = getStorage();
        const userFolderRef = ref(storage, `userDocuments/${userId}`);
        const documentRef = ref(userFolderRef, `${newDocRef.id}/${formData.document.name}`);
        await uploadString(documentRef, formData.document.content, 'data_url');
      }

      // Clear the form after submission
      setFormData({
        title: '',
        category: '',
        problem: '',
        treatment: '',
        document: null,
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
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          document: {
            name: file.name,
            content: reader.result,
          },
        }));
      };

      reader.readAsDataURL(file);
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
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleDocumentUpload} />
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
