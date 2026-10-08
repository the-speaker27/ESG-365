import { Link } from "react-router-dom";

export default function SubmissionTable({ columns, rows, emptyMessage = "No submissions found.", emptyAction }) {
  if (!rows.length) {
    const isSubmissions = emptyMessage.toLowerCase().includes("submission");
    return (
      <div className="empty-state empty-state-rich">
        <span className="empty-icon" aria-hidden="true">{isSubmissions ? "▤" : "◌"}</span>
        <div><strong>{isSubmissions ? "No ESG submissions yet" : "No records to display"}</strong><span>{emptyMessage}</span></div>
        {emptyAction && <Link className="button button-primary" to={emptyAction.to}>{emptyAction.label}</Link>}
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.project?.id ?? row.projectId ?? index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}