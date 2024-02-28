export function changeName(name: string): string[] {
  // Trim the name to remove leading and trailing spaces
  name = name.trim();
  
  // Convert the name to lowercase
  const lowercaseName = name.toLowerCase();

  // Split the name by spaces
  const nameParts = name.split(/\s+/);

  const variations: string[] = [];

  // Add lowercase name with hyphen
  variations.push(lowercaseName.replace(/\s+/g, '-'));

  // Add original name
  variations.push(name);

  // Add lowercase name
  variations.push(lowercaseName);

  // Add individual name parts
  nameParts.forEach(part => {
    variations.push(part);
    variations.push(part.toLowerCase());
  });

  return variations;
}
