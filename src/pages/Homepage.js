import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Typography, Button, List, ListItem, Grid, Paper, LinearProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

function Homepage() {
  const [selectedZip, setSelectedZip] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [paused, setPaused] = useState(true); // Initially paused
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0); // Index to track current file being processed

  const handleZipChange = async (event) => {
    try {
      setLoading(true);
      const zipFile = event.target.files[0];
      const zip = new JSZip();
      await zip.loadAsync(zipFile);
      const files = Object.values(zip.files)
        .filter(zipEntry => !zipEntry.dir)
        .map(zipEntry => zipEntry.name);

      setFilesList(files);
      setSelectedZip(zipFile);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error unzipping files: ' + err.message);
    }
  };

  const handleDestinationChange = async (event) => {
    try {
      setLoading(true);
      const directoryHandle = await window.showDirectoryPicker();
      setSelectedDestination(directoryHandle);
      setLoading(false);
      setPaused(false); // Start processing when destination is selected
    } catch (err) {
      setLoading(false);
      setError('Error selecting destination: ' + err.message);
    }
  };

  useEffect(() => {
    const processFiles = async () => {
      const zip = new JSZip();
      await zip.loadAsync(selectedZip);

      const files = Object.values(zip.files).filter(zipEntry => !zipEntry.dir);
      const zipEntry = files[index];

      if (zipEntry) {
        const directoryHandle = selectedDestination;
        await copyFile(zipEntry, directoryHandle);
        setIndex(prevIndex => prevIndex + 1);
      } else {
        setLoading(false);
      }
    };

    if (!paused) {
      setLoading(true);
      processFiles();
    }
  }, [paused, index, selectedDestination, selectedZip]);

  const copyFile = async (zipEntry, directoryHandle) => {
    const content = await zipEntry.async('blob');
    const fileName = zipEntry.name.split('/').pop();
    const newName = `${fileName} - Copy`;
    const fileHandle = await directoryHandle.getFileHandle(newName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    setProcessedFiles((prevFiles) => [...prevFiles, newName]);
  };

  const handleTogglePause = () => {
    setPaused(prevPaused => !prevPaused);
  };

  return (
    <Grid container spacing={2} justifyContent="center" style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h4" align="center">Zip File Extractor</Typography>
          <Grid container justifyContent="center" spacing={2} style={{ marginTop: '10px' }}>
            <Grid item>
              <Button variant="contained" component="label">
                Select Zip File to Extract
                <input id='zipupload' type="file" accept=".zip" onChange={handleZipChange} hidden />
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleDestinationChange} disabled={!selectedZip}>Extract to Destination Folder</Button>
            </Grid>

          </Grid>
          {loading && !paused && <LinearProgress style={{ marginTop: '20px' }} />}
          {error && <Typography variant="body1" style={{ color: 'red', marginTop: '20px' }}>{error}</Typography>}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} >
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5" align='left'>
            Source: {selectedZip?.name}
          </Typography>
          <List>
            {filesList.map((file, index) => (
              <ListItem key={index}>{file}</ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Grid container spacing={2}>
            <Grid item>
              <Typography variant="h5" align='left' >
                Destination: {selectedDestination?.name}
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleTogglePause} disabled={!selectedZip || !selectedDestination}>
                {paused ? <PlayArrowIcon /> : <PauseIcon />}
                {paused ? 'Play' : 'Pause'}
              </Button>
            </Grid>
          </Grid>

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

export default Homepage;
