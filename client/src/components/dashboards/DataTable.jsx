export default function DataTable({ caption, columns, rows = [], loading = false, empty = 'No records found.', renderRow }) {
  return <div className="table-wrap"><table><caption>{caption}</caption><thead><tr>{columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length}>Loading…</td></tr> : rows.length ? rows.map(renderRow) : <tr><td colSpan={columns.length}>{empty}</td></tr>}</tbody></table></div>;
}
