import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

import "./DatasetDetails.css";

function DatasetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsLoading, setRowsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Validation Filter
  const [status, setStatus] = useState("all");

  const limit = 10;


  // Dataset + validation summary
  useEffect(() => {
    fetchDatasetInfo();
  }, [id]);


  // Rows change when page or filter changes
  useEffect(() => {
    fetchRows();
  }, [id, page, status]);


  const fetchDatasetInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        datasetResponse,
        summaryResponse
      ] = await Promise.all([
        fetch(
          `http://localhost:5000/api/datasets/${id}`
        ),

        fetch(
          `http://localhost:5000/api/datasets/${id}/validation-summary`
        )
      ]);


      const datasetResult =
        await datasetResponse.json();

      const summaryResult =
        await summaryResponse.json();


      if (
        !datasetResponse.ok ||
        !summaryResponse.ok
      ) {
        throw new Error(
          "Failed to fetch dataset details"
        );
      }


      setDataset(
        datasetResult.dataset
      );

      setSummary(
        summaryResult.summary
      );

    } catch (error) {
      console.error(
        "Dataset details error:",
        error
      );

      setErrorMessage(
        error.message ||
        "Failed to fetch dataset details"
      );

    } finally {
      setLoading(false);
    }
  };


  const fetchRows = async () => {
    try {
      setRowsLoading(true);

      let url =
        `http://localhost:5000/api/datasets/${id}/rows?page=${page}&limit=${limit}`;

      if (status !== "all") {
        url += `&status=${status}`;
      }


      const response = await fetch(url);

      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to fetch dataset rows"
        );
      }


      setRows(
        result.rows || []
      );

      setPagination(
        result.pagination
      );

    } catch (error) {
      console.error(
        "Dataset rows error:",
        error
      );

      setErrorMessage(
        error.message ||
        "Failed to fetch dataset rows"
      );

    } finally {
      setRowsLoading(false);
    }
  };


  const handleStatusChange = (value) => {
    setStatus(value);

    // Filter change karte hi first page
    setPage(1);
  };


  if (loading) {
    return (
      <div className="dataset-details-page">
        <p>
          Loading dataset details...
        </p>
      </div>
    );
  }


  if (errorMessage) {
    return (
      <div className="dataset-details-page">

        <button
          type="button"
          className="dataset-back-button"
          onClick={() =>
            navigate("/datasets")
          }
        >
          ← Back to Datasets
        </button>

        <p>
          {errorMessage}
        </p>

      </div>
    );
  }


  if (!dataset) {
    return (
      <div className="dataset-details-page">
        <p>
          Dataset not found.
        </p>
      </div>
    );
  }


  return (
    <div className="dataset-details-page">

      <button
        type="button"
        className="dataset-back-button"
        onClick={() =>
          navigate("/datasets")
        }
      >
        ← Back to Datasets
      </button>


      <div className="dataset-details-header">

        <h1>
          {dataset.datasetName}
        </h1>

        <p>
          {dataset.originalFileName}
        </p>

      </div>


      {/* Dataset Information + Validation */}

      <div className="dataset-details-grid">

        <section className="dataset-info">

          <h2>
            Dataset Information
          </h2>

          <p>
            <strong>Total Rows:</strong>{" "}
            {dataset.totalRows}
          </p>

          <p>
            <strong>Columns:</strong>{" "}
            {dataset.columns.join(", ")}
          </p>

          <p>
            <strong>File Type:</strong>{" "}
            {dataset.fileType}
          </p>

        </section>


        {summary && (

          <section className="validation-summary">

            <h2>
              Validation Summary
            </h2>


            <div className="validation-stats">

              <div className="validation-stat">

                <span>
                  Total Rows
                </span>

                <strong>
                  {summary.totalRows}
                </strong>

              </div>


              <div className="validation-stat">

                <span>
                  Valid Rows
                </span>

                <strong>
                  {summary.validRows}
                </strong>

              </div>


              <div className="validation-stat">

                <span>
                  Invalid Rows
                </span>

                <strong>
                  {summary.invalidRows}
                </strong>

              </div>

            </div>

          </section>

        )}

      </div>


      {/* Dataset Preview */}

      <section className="dataset-preview">

        <div className="dataset-preview-header">

          <h2>
            Dataset Preview
          </h2>


          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
              )
            }
            className="status-filter"
          >

            <option value="all">
              All Rows
            </option>

            <option value="valid">
              Valid Rows
            </option>

            <option value="invalid">
              Invalid Rows
            </option>

          </select>

        </div>


        {rowsLoading ? (

          <p>
            Loading rows...
          </p>

        ) : rows.length === 0 ? (

          <p>
            No rows found.
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  {dataset.columns.map(
                    (column) => (

                      <th
                        key={column}
                      >
                        {column}
                      </th>

                    )
                  )}

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {rows.map(
                  (row) => (

                    <tr
                      key={row._id}
                    >

                      {dataset.columns.map(
                        (column) => (

                          <td
                            key={column}
                          >

                            {row.data[
                              column
                            ] ?? "-"}

                          </td>

                        )
                      )}


                      <td
                        className={
                          row.isValid
                            ? "status-valid"
                            : "status-invalid"
                        }
                      >

                        {row.isValid
                          ? "Valid"
                          : "Invalid"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* Pagination */}

        {pagination &&
          pagination.totalPages > 1 && (

            <div className="pagination">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage(page - 1)
                }
              >
                ← Previous
              </button>


              <span>

                Page {pagination.page} of{" "}
                {pagination.totalPages}

              </span>


              <button
                type="button"
                disabled={
                  page ===
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(page + 1)
                }
              >
                Next →
              </button>

            </div>

          )}

      </section>

    </div>
  );
}

export default DatasetDetails;