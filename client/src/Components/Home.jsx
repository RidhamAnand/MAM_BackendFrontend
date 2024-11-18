import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, TextField } from '@mui/material';


const formatDate = (img)=>{
    const date = new Date(img.createdAt);
    const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
    const istDate = new Date(date.getTime() + istOffset);
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
    const iTime = `${hours}:${minutes}:${seconds}`;

    return iTime;

}


function Home() {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get("http://localhost:8000/getImages");
                setImages(response.data.images);
                console.log("Images fetched:", response.data.images);
                setIsLoading(false);
                
            } catch (e) {
                console.log(e);
            }
        };

        // Fetch images on component mount
        fetchImages();

        // Create a WebSocket connection
        const ws = new WebSocket('ws://localhost:8000'); // Adjust the URL as needed

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            window.alert("Someone rang the bell");
            window.location.reload();
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        // Clean up on component unmount
        return () => {
            ws.close();
        };

    }, []); // Empty dependency array to run only on mount

    const handleSendResponse = async () => {
        try {
            await axios.post("http://localhost:8000/sendResponse", { message: responseMessage });
            console.log("Response sent:", responseMessage);
            textToSpeech(responseMessage); // Convert typed response to speech
            setResponseMessage(''); // Clear the input field
        } catch (error) {
            console.error("Error sending response:", error);
        }
    };

    const textToSpeech = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div   
        
        className='flex flex-row px-20 justify-between gap-10 items-center w-screen max-h-screen'>

            <div className='shadow-2xl basis-2/3 bg-white rounded-lg p-10 flex flex-col justify-start items-center gap-4'>
                <h1 className='font-medium text-3xl'>Most Recent</h1>
                <p className='text-xl'>Someone is at the door</p>

                {isLoading ? (
                    <CircularProgress />
                ) : (
                    images && (
                        <div>
                            <img src={images[0].url} alt="Most Recent" />
                            <p>Date: {images[0].createdAt.slice(0, 10)}</p>
                            <p>Time: {formatDate(images[0])}</p>
                        </div>
                    )
                )}

                <TextField
                    required={true}
                    fullWidth
                    placeholder='Type Response'
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                />
                <Button fullWidth variant='contained' onClick={handleSendResponse}>
                    Send Response
                </Button>
            </div>

            <div className='shadow-2xl max-h-screen bg-white rounded-lg px-10 flex overflow-x-hidden flex-col h-full overflow-scroll items-center justify-start text-center'>
                <h1 className='my-4 text-2xl font-medium'>Past Events</h1>

                {isLoading ? <CircularProgress /> : (
                    <div className='flex flex-col gap-5'>
                        {images.slice(1).map((img) => {
                            const date = new Date(img.createdAt);
                            const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
                            const istDate = new Date(date.getTime() + istOffset);
                            const hours = String(istDate.getUTCHours()).padStart(2, '0');
                            const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
                            const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
                            const iTime = `${hours}:${minutes}:${seconds}`;

                            return (
                                <div key={img.id} className='py-2 px-6 border border-black rounded-sm'>
                                    <img className='rounded-md' src={img.url} alt="Past Event" />
                                    <p>Date: {img.createdAt.slice(0, 10)}</p>
                                    <p>Time: {iTime}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
