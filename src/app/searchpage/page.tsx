"use client";
import React , {useState} from 'react';
import axios from 'axios';

function SearchPage() {
  const [query,setQuery] = useState('');
  const [results,setResults] = useState<string[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  
  const handleSearch = async() => {
    setLoading(true);
    try{
      const response = await axios.get(`http://localhost:8000/search?query=${query}`);
      setResults(response.data.results || []);
    } catch (err)
    {
      setError('Error fetching search results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Search Files</h1>
        <input 
         type='text'
         value={query}
         onChange={(e)=>setQuery(e.target.value)}
         className="w-full p-2 mb-4 border border-gray-300 rounded"
         placeholder='Enter search query'
        />
        <button
         onClick={handleSearch}
         className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Search
        </button>
        {loading && <p className="text-center mt-4">Searching...</p>}
        {error && <p className="text-center mt-4 text-red-500">{error}</p>}
        <ul className='mt-4'>
          {results.map((result,index)=>(
            <li key={index} className='p-2 border border-gray-300 rounded mb-2'>
              {result}
            </li>
          ))}
         </ul>
      </div>
    </div>
  );
};

export default SearchPage;