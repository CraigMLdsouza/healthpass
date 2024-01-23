// src/components/MedicalRecords.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firestore from '../firebase';
import { Link } from 'react-router-dom';

import './MedicalRecords.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [userId, setUserId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserId(user.uid);
      } else {
        // User is signed out
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!userId) {
        console.error('User ID not available');
        return;
      }

      try {
        // Query the 'dataEntries' subcollection within the user's document, ordered by timestamp
        const userDocRef = collection(firestore, 'users', userId, 'dataEntries');
        const userRecordsSnapshot = await getDocs(query(userDocRef, orderBy('timestamp', 'desc')));
        const userRecordsData = userRecordsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecords(userRecordsData);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      }
    };

    fetchMedicalRecords();
  }, [userId]);

  const handleCardToggle = (cardId) => {
    setExpandedCardId((prevId) => (prevId === cardId ? null : cardId));
  };

  const handleDownloadDocuments = async (documents, userId, recordId) => {
    try {
      const downloadPromises = documents.map(async (doc, index) => {
        const storage = getStorage();
        const documentRef = ref(storage, `userDocuments/${userId}/${recordId}/${doc.name}`);
        const downloadURL = await getDownloadURL(documentRef);
  
        // Create a temporary link element and trigger the download
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `Document_${index + 1}_${doc.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  
      await Promise.all(downloadPromises);
    } catch (error) {
      console.error('Error downloading documents:', error);
    }
  };
  

  return (
    <div className="medical-records-container">
      <h1>Medical Records</h1>
      <Link to="/data-entry">
        <button className="data-entry-button">Go to Data Entry</button>
      </Link>
      {records.map((record) => (
        <div key={record.id} className={`medical-record-card ${expandedCardId === record.id ? 'expanded' : ''}`} onClick={() => handleCardToggle(record.id)}>
          <div className="record-info">
            <h3 className="record-name">{record.title}</h3>
            {expandedCardId === record.id && (
              <div className="expanded-content">
                <p>Date of Birth: {record.dob}</p>
                <p>Category: {record.category}</p>
                <p>Problem: {record.problem}</p>
                <p>Treatment: {record.treatment}</p>
                <p>Date and Time: {record.dateAndTime}</p>
                <p>Location: {record.location}</p>
                <p>Doctor Info: {record.doctorInfo}</p>
                {record.documents && record.documents.length > 0 && (
                  <div>
                    <p>Documents:</p>
                    <ul>
                      {record.documents.map((document, index) => (
                        <li key={index}>
                          <a className = "download-buttons" href={document.url} target="_blank" rel="noopener noreferrer" download>{`Download Document ${index + 1}`}</a>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleDownloadDocuments(record.documents, userId, record.id)}>
                      Download All Documents
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="entry-date">{new Date(record.timestamp.toDate()).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default MedicalRecords;
