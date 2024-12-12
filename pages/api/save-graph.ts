import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const updatedGraph = req.body;
    
    // Convert the graph to a string format
    const graphString = `export const stationGraph = ${JSON.stringify(updatedGraph, null, 2)};`;
    
    // Save to a file (you might want to adjust the path according to your project structure)
    const filePath = path.join(process.cwd(), 'data', 'station-graph.ts');
    fs.writeFileSync(filePath, graphString);

    res.status(200).json({ message: 'Graph updated successfully' });
  } catch (error) {
    console.error('Error saving graph:', error);
    res.status(500).json({ message: 'Failed to save graph' });
  }
}