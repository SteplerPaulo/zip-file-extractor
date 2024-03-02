import React, { useState, useEffect } from 'react';
import JSZip from 'jszip'; // Add this import
import { Typography, Button, List, ListItem, Grid, Paper, CircularProgress } from '@mui/material';

function App() {
  const [selectedZip, setSelectedZip] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleUnzip = () => {
    if (selectedZip && selectedDestination) {
      unzipFiles(selectedZip);
    }
  };

  const handleCopy = () => {
    if (selectedZip && selectedDestination) {
      copyFiles(selectedZip);
    }
  };

  const unzipFiles = async (zipFile) => {
    try {
      setLoading(true);
      const zip = new JSZip();
      await zip.loadAsync(zipFile);
      console.log('Files', zip.files)

      const files = Object.values(zip.files)
        .filter(zipEntry => !zipEntry.dir) // Filter out directories
        .map(zipEntry => zipEntry.name); // Get file names

      setFilesList(files);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error unzipping files: ' + err.message);
    }
  };

  const copyFiles = async (zipFile) => {
    try {
      setLoading(true);
      const zip = new JSZip();
      await zip.loadAsync(zipFile);

      await Promise.all(
        Object.values(zip.files)
          .filter(zipEntry => !zipEntry.dir) // Filter out directories
          .map(zipEntry => saveFile(zipEntry)) // Save each file
      );
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error copying files: ' + err.message);
    }
  };

  const saveFile = async (zipEntry) => {
    if (!selectedDestination) {
      setError('Please select a destination.');
      return;
    }

    try {
      const content = await zipEntry.async('blob');
      const fileName = zipEntry.name.split('/').pop(); // Extracting filename from path
      const newName = `Copy of ${fileName}`; // Rename filename

      const fileHandle = await selectedDestination.getFileHandle(newName, { create: true });

      // Write the contents of the file
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      // Keep track of processed files
      setProcessedFiles((prevFiles) => [...prevFiles, newName]);
    } catch (err) {
      setError('Error saving file: ' + err.message);
    }
  };

  const handleZipChange = (event) => {
    setSelectedZip(event.target.files[0]);
  };

  const handleDestinationChange = async (event) => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      setSelectedDestination(directoryHandle);
    } catch (err) {
      console.log('Error: ' + err.message);
    }

  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleContinue = () => {
    setPaused(false);
  };


  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h4" align="center">Zip File Extractor</Typography>

          <Grid container justifyContent="center" spacing={2} style={{ marginTop: '20px' }}>
            <Grid item>
              <Button variant="contained" component="label">
                Upload Zip File
                <input id='zipupload' type="file" accept=".zip" onChange={handleZipChange} hidden />
              </Button>
              {selectedZip && <Typography variant="body1" style={{ marginTop: '8px' }}>Selected Zip: {selectedZip.name}</Typography>}
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleDestinationChange}>Select Destination Folder</Button>
              {selectedDestination && <Typography variant="body1" style={{ marginTop: '8px' }}>Selected Destination: {selectedDestination.name}</Typography>}
            </Grid>
          </Grid>

          <Grid container justifyContent="center" spacing={2} style={{ marginTop: '20px' }}>
            <Grid item>
              <Button variant="contained" onClick={handleUnzip}>Unzip</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleCopy}>Copy</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handlePause} disabled={paused}>Pause</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleContinue} disabled={!paused}>Continue</Button>
            </Grid>
          </Grid>
          {loading && <CircularProgress style={{ marginTop: '20px' }} />}
          {error && <Typography variant="body1" style={{ color: 'red', marginTop: '20px' }}>{error}</Typography>}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5">Files:</Typography>
          <List>
            {filesList.map((file, index) => (
              <ListItem key={index}>{file}</ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5">Processed Files:</Typography>
          <List>
            {processedFiles.map((file, index) => (
              <ListItem key={index}>{file}</ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default App;
