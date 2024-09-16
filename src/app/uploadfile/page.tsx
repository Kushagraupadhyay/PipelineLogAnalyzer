"use client";
import React , {useState,useCallback} from 'react';
import {useDropzone} from 'react-dropzone'; // to handle drag and drop file upload
import axios from 'axios'
import {Link,NavLink} from 'react-router-dom' 

interface ErrorDetails {
  [file: string]: string[];
}
interface AgentDetails {
  [file: string]: string[];
}

function UploadFile() {
  
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [aiResponses, setAiResponses] = useState<{[key:string] :string} | null>({}) ;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    axios.post('http://localhost:8000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      setAgentDetails(response.data.agent_details);
      setErrorDetails(response.data.error_details);
    }).catch(error => {
      console.log(error);
    });
  }, []);

  const generateAIResponse = async (errorLine: string, file: string, detailIndex: number) => {
    try {
      const response = await axios.post('/api/airesponse', {"errorlinekey": errorLine});

      const responseText = response.data.result || '';
      //console.log('responseText:', responseText);
      setAiResponses(prevResponses => ({
        ...prevResponses,
        [`${file}-${detailIndex}`]: responseText, // Use a unique key for each response
      }));
    } catch (err) {
      console.error('AI Response Error:', err);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    multiple: false
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 ">
      {/* Header */}
      <header className="absolute top-0 left-0 bg-blue-600 text-white p-4 shadow-md flex items-center w-full">
        <div className="container mx-auto flex items-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft Logo" className="h-8 mr-4" />
          <h1 className="text-2xl font-bold">Pipeline Log Analyzer</h1>
        </div>
      </header>
      {/* Main */}
      <main className="flex flex-col items-center justify-start flex-grow container mx-auto px-4 mt-8">
      <div {...getRootProps()} className="w-full max-w-md p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors duration-300 mt-16">
        <input {...getInputProps()} className="hidden" />
        <p className="text-center text-gray-500">Drag and drop the pipeline log zip here, or click to select a file</p>
      </div>
      {agentDetails && (
        <div className="w-full max-w-max p-4 bg-white rounded-lg shadow-md mt-4">
          <p className="text-center text-gray-500 text-lg font-semibold mb-2">Agent Related Information</p>
          {Object.keys(agentDetails).map((file, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-md font-semibold text-blue-600">File Path: {file}</h3>
              {agentDetails[file].map((detail, detailIndex) => (
                <div key={detailIndex} className="mb-2">
                  <pre className="whitespace-pre-wrap text-sm text-red-600 bg-red-100 p-2 rounded border border-red-200">{detail}</pre>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {errorDetails && (
        <div className="w-full max-w-max p-4 bg-white rounded-lg shadow-md mt-4 mb-4">
          <p className="text-center text-gray-500 text-lg font-semibold mb-2">Errors found in pipeline log</p>
          {Object.keys(errorDetails).map((file, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-md font-semibold text-blue-600">File Path: {file}</h3>
              {errorDetails[file].map((detail, detailIndex) => (
                <div key={detailIndex} className="mb-2">
                  <pre className="whitespace-pre-wrap text-sm text-red-600 bg-red-100 p-2 rounded border border-red-200">{detail}</pre>
                  <button
                    onClick={() => generateAIResponse(detail, file, detailIndex)}
                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                  >
                    Generate AI Response
                  </button>
                  {aiResponses && aiResponses[`${file}-${detailIndex}`] && (
                    <pre className="whitespace-pre-wrap text-sm text-blue-600 mt-2">
                      {aiResponses[`${file}-${detailIndex}`]}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      </main>
      {/* Footer */}
      <footer className="bg-blue-600 text-white p-4 shadow-md w-full mt-auto">
        <div className="container mx-auto text-right">
          <p>&copy; 2023 Pipeline Log Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default UploadFile;