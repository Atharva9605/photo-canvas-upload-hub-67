
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  uploadDate: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching photos from an API
    setTimeout(() => {
      const demoPhotos: Photo[] = [
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
          title: "Colorful Abstract",
          uploadDate: "2025-04-08",
        },
        {
          id: "2",
          url: "https://images.unsplash.com/photo-1554080353-a576cf803bda",
          title: "Ocean Sunset",
          uploadDate: "2025-04-07",
        },
        {
          id: "3",
          url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65",
          title: "Neon Lights",
          uploadDate: "2025-04-06",
        },
        {
          id: "4",
          url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7",
          title: "Mountain View",
          uploadDate: "2025-04-05",
        },
        {
          id: "5",
          url: "https://images.unsplash.com/photo-1515789391370-6362a4c9c300",
          title: "Beach Day",
          uploadDate: "2025-04-04",
        },
        {
          id: "6",
          url: "https://images.unsplash.com/photo-1579187707643-35646d22b596",
          title: "Winter Landscape",
          uploadDate: "2025-04-03",
        },
      ];
      
      setPhotos(demoPhotos);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Gallery</h1>
          <Link to="/upload">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="photo-card animate-pulse">
                <div className="aspect-square w-full bg-gray-200"></div>
                <div className="p-3">
                  <div className="mb-2 h-5 w-2/3 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="photo-card-image"
                />
                <div className="p-3">
                  <h3 className="font-medium">{photo.title}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(photo.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No photos yet</h3>
            <p className="mb-4 text-sm text-gray-500">
              Upload your first photo to get started
            </p>
            <Link to="/upload">
              <Button>Upload Photo</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
