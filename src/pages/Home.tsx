
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Layers } from "lucide-react";

const Home = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to <span className="text-brand-600">PhotoCanvas</span>
          </h1>
          <p className="mx-auto max-w-2xl text-gray-500">
            Upload, manage, and organize all your photos in one place. 
            Support for any type of photos including text, images, drawings, or mixed content.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Upload className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Easy Uploads</h2>
            <p className="mb-4 text-gray-500">
              Drag and drop or select files to upload your photos quickly and easily.
            </p>
            <Link to="/upload" className="mt-auto">
              <Button variant="outline" className="w-full">
                Upload Now
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <ImageIcon className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Photo Gallery</h2>
            <p className="mb-4 text-gray-500">
              Browse and organize all your uploaded photos in a beautiful gallery view.
            </p>
            <Link to="/gallery" className="mt-auto">
              <Button variant="outline" className="w-full">
                View Gallery
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Multi-Format Support</h2>
            <p className="mb-4 text-gray-500">
              Support for all common image formats including JPG, PNG, GIF, and WebP.
            </p>
            <Link to="/upload" className="mt-auto">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 p-8 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-6 max-w-2xl">
            Join thousands of users who trust PhotoCanvas for managing their personal and professional photo collections.
          </p>
          <Link to="/upload">
            <Button className="bg-white text-brand-700 hover:bg-gray-100">
              Upload Your First Photo
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
