import { getAllSongs } from './lib/s3.js';

async function testGetAllSongs() {
  console.log('Testing getAllSongs...');
  try {
    const songs = await getAllSongs();
    console.log(`Successfully fetched ${songs.length} songs`);
    console.log('First 5 songs:');
    songs.slice(0, 5).forEach((song, index) => {
      console.log(`  ${index + 1}. ${song.title} (${song.url})`);
    });
    if (songs.length > 5) {
      console.log(`... and ${songs.length - 5} more songs.`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testGetAllSongs();