import React, { useState, useEffect } from 'react';
import { Carousel } from './components/Carousel';
import { useFetch } from './hooks/useFetch';

const App = () => {
  const { data: apiResponse, isLoading, error } = useFetch('https://dummyjson.com/products?limit=10');
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // This effect runs when the apiResponse data changes.
    // It transforms the raw API data into the format the Carousel component expects.
    if (apiResponse && Array.isArray(apiResponse.products)) {
        const transformedCards = apiResponse.products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          image: product.images[0] || 'https://via.placeholder.com/600x300?text=No+Image', // Use first image or a placeholder
        }));
        setCards(transformedCards);
    }
  }, [apiResponse]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500 text-xl">Loading cards...</p>;
    }
    if (error) {
      return (
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">Failed to load data</p>
          <p>There was an issue fetching data from the API.</p>
          <p className="text-sm mt-2">Error: {error}</p>
        </div>
      );
    }
    // Handle the case where the API call was successful but there are no cards to show
    if (cards.length === 0) {
        return <p className="text-center text-gray-500 text-xl">No cards found.</p>;
    }
    return <Carousel cards={cards} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
