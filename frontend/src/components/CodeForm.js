import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CodeForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    language: "cpp",
    stdin: "",
    sourceCode: "",
  });
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/submit", formData)
      .then((res) => {
        console.log(res.data);

        navigate("/entries"); 
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="container border shadow-sm p-3 mb-5 bg-body-tertiary rounded mt-4">
      <h2>Submit Code Snippet</h2>
      <form onSubmit={handleSubmit} className="align-center">
        <div className="row d-flex justify-content-between">
          <div className="col-md-8">
            <div className="mb-3 text-start">
              <label className="form-label mx-1">Username:</label>
              <input
                type="text"
                className="form-control" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col">
            <div className="mb-3 text-end">
              <label className="form-label mx-1">Preferred Language:</label>
              <select
                name="language"
                className="form-select" 
                value={formData.language}
                onChange={handleChange}
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label>Source Code:</label>
          <textarea
            name="sourceCode"
            className="form-control"
            value={formData.sourceCode}
            onChange={handleChange}
            rows="10"
            cols="130"
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Standard Input:</label>
          <textarea
            name="stdin"
            className="form-control"
            value={formData.stdin}
            onChange={handleChange}
            rows="4"
            cols="50"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary ">
          Submit
        </button>{" "}
      </form>
    </div>
  );
};

export default CodeForm;
