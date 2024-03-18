import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CodeEntriesTable = () => {
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  useEffect(() => {
    axios.get('http://localhost:5000/api/entries')
      .then(res => {
        setEntries(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  // Get current entries
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < Math.ceil(entries.length / entriesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='container border shadow-sm p-3 mb-5 bg-body-tertiary rounded mt-4'>
      <h1>Code Snippets</h1>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">  
              <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
            </th>
            <th scope="col">Username</th>
            <th scope="col">Language</th>
            <th scope="col">Standard Input</th>
            <th scope="col">Timestamp</th>
            <th scope="col">Stdout</th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map(entry => (
            <tr key={entry.id}>
              <th scope="row">
                <input className="form-check-input" type="checkbox" value="" id={entry.id}/>
              </th>
              <td>{entry.username}</td>
              <td>{entry.language}</td>
              <td>{entry.stdin}</td>
              <td>{entry.timestamp}</td>
              <td>{entry.stdout}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button onClick={prevPage} className="page-link">Previous</button>
          </li>
          {Array.from({ length: Math.ceil(entries.length / entriesPerPage) }).map((_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button onClick={() => paginate(index + 1)} className="page-link">
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === Math.ceil(entries.length / entriesPerPage) ? 'disabled' : ''}`}>
            <button onClick={nextPage} className="page-link">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CodeEntriesTable;
