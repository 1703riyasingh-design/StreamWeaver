import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DatasetList.css";

function DatasetList() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "http://localhost:5000/api/datasets"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch datasets"
        );
      }

      setDatasets(result.datasets || []);

    } catch (error) {
      console.error(
        "Fetch datasets error:",
        error
      );

      setErrorMessage(
        error.message || "Failed to fetch datasets"
      );

    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (datasetId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this dataset?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/datasets/${datasetId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete dataset"
        );
      }

      setDatasets((previousDatasets) =>
        previousDatasets.filter(
          (dataset) => dataset._id !== datasetId
        )
      );

      alert("Dataset deleted successfully!");

    } catch (error) {
      console.error(
        "Delete dataset error:",
        error
      );

      alert(
        error.message || "Failed to delete dataset"
      );
    }
  };


  return (
    <div className="dataset-list-page">

      {/* Page Header */}

      <div className="dataset-list-header">

        <div>
          <h1>Uploaded Datasets</h1>

          <p>
            View and manage all uploaded datasets.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDatasets}
        >
          Refresh
        </button>

      </div>


      {/* Loading */}

      {loading && (
        <p>
          Loading datasets...
        </p>
      )}


      {/* Error */}

      {errorMessage && (
        <p>
          {errorMessage}
        </p>
      )}


      {/* No Datasets */}

      {!loading &&
        !errorMessage &&
        datasets.length === 0 && (

          <p>
            No datasets uploaded yet.
          </p>

        )}


      {/* Dataset Cards */}

      {!loading &&
        !errorMessage &&
        datasets.length > 0 && (

          <div className="dataset-grid">

            {datasets.map((dataset) => (

              <div
                key={dataset._id}
                className="dataset-card"
              >

                <h3>
                  {dataset.datasetName}
                </h3>


                <p>
                  <strong>File:</strong>{" "}
                  {dataset.originalFileName}
                </p>


                <p>
                  <strong>Total Rows:</strong>{" "}
                  {dataset.totalRows}
                </p>


                <p>
                  <strong>Columns:</strong>{" "}
                  {dataset.columns.join(", ")}
                </p>


                <p>
                  <strong>Uploaded:</strong>{" "}
                  {new Date(
                    dataset.createdAt
                  ).toLocaleString()}
                </p>


                {/* Dataset Card Buttons */}

                <div className="dataset-card-actions">

                  <button
                    type="button"
                    className="view-dataset-button"
                    onClick={() =>
                      navigate(
                        `/datasets/${dataset._id}`
                      )
                    }
                  >
                    View Details
                  </button>


                  <button
                    type="button"
                    className="delete-dataset-button"
                    onClick={() =>
                      handleDelete(dataset._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default DatasetList;