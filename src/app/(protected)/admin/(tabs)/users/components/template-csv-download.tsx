import React from "react";

const TemplateCsvDownload = ({ headers }: { headers: string[] }) => {
  // Function to generate the CSV content (header only)
  const generateCsvContent = (): string => {
    // Create CSV header row
    // const headers = ["name", "email", "role"];
    // You can add a newline at the end; additional rows can be appended if desired
    return `${headers.join(",")}\n`;
  };

  // Function to handle the download action
  const handleDownload = () => {
    // Generate the CSV content
    const csvContent = generateCsvContent();
    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    // Set the default file name for the download
    link.setAttribute("download", "template.csv");
    // Append the link to the document and trigger the click event programmatically
    document.body.appendChild(link);
    link.click();
    // Clean up and remove the link
    document.body.removeChild(link);
    // Release the object URL
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-start">
      <button
        onClick={handleDownload}
        className="cursor-pointer border-0 bg-transparent p-0 text-blue-500 underline"
      >
        Download Template CSV
      </button>
    </div>
  );
};

export default TemplateCsvDownload;
