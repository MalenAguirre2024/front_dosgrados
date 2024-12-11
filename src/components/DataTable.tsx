type Column = {
  header: string;
  accessor: string;
  type?: 'image' | 'text' | 'custom';
  render?: (row: any) => JSX.Element; // Función opcional para renderizado
};

export function DataTable({
  data,
  columns,
  selectedImages,
  onImageSelect,
}: {
  data: any[];
  columns: Column[];
  selectedImages: { [key: string]: boolean };
  onImageSelect: (id: string) => void;
}) {
  if (!data.length) return null;

  const renderCell = (
    value: any,
    type?: string,
    row?: any,
    render?: (row: any) => JSX.Element
  ) => {
    if (render) {
      return render(row);
    }
    if (type === 'image') {
      return (
        <img
          src={value}
          alt="Analysis result"
          className="w-20 h-20 object-cover rounded-md cursor-pointer"
          onClick={() => {
            const link = document.createElement('a');
            link.href = value;
            link.download = value.split('/').pop() || 'image.jpg';
            link.click();
          }}
        />
      );
    }
    return value || '';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.accessor === 'select' && row.imageUrl ? (
                    <input
                      type="checkbox"
                      checked={!!selectedImages[row.imageUrl]}
                      onChange={() => onImageSelect(row.imageUrl)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    renderCell(row[column.accessor] || '', column.type, row, column.render)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
