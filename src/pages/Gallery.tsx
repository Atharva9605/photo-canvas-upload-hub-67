import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Filter, 
  Share, 
  Search, 
  SlidersHorizontal, 
  ChevronDown,
  FileSpreadsheet 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ShareDialog } from "@/components/ShareDialog";

interface Photo {
  id: string;
  url: string;
  title: string;
  uploadDate: string;
  tags?: string[];
  description?: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("all");
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setTimeout(() => {
      const demoPhotos: Photo[] = [
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
          title: "Colorful Abstract",
          uploadDate: "2025-04-08",
          tags: ["abstract", "colorful", "artwork"],
          description: "A vibrant and colorful abstract artwork with various geometric shapes."
        },
        {
          id: "2",
          url: "https://images.unsplash.com/photo-1554080353-a576cf803bda",
          title: "Ocean Sunset",
          uploadDate: "2025-04-07",
          tags: ["nature", "sunset", "ocean"],
          description: "Beautiful sunset over the ocean with vibrant orange and pink hues."
        },
        {
          id: "3",
          url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65",
          title: "Neon Lights",
          uploadDate: "2025-04-06",
          tags: ["urban", "night", "neon"],
          description: "Vibrant neon lights illuminating a dark urban setting."
        },
        {
          id: "4",
          url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7",
          title: "Mountain View",
          uploadDate: "2025-04-05",
          tags: ["nature", "mountains", "landscape"],
          description: "A breathtaking view of snow-capped mountains against a clear blue sky."
        },
        {
          id: "5",
          url: "https://images.unsplash.com/photo-1515789391370-6362a4c9c300",
          title: "Beach Day",
          uploadDate: "2025-04-04",
          tags: ["nature", "beach", "summer"],
          description: "A sunny day at the beach with golden sand and crystal clear waters."
        },
        {
          id: "6",
          url: "https://images.unsplash.com/photo-1579187707643-35646d22b596",
          title: "Winter Landscape",
          uploadDate: "2025-04-03",
          tags: ["nature", "winter", "snow"],
          description: "A serene winter landscape covered in pristine white snow."
        },
      ];
      
      setPhotos(demoPhotos);
      setFilteredPhotos(demoPhotos);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let result = [...photos];
    
    if (searchQuery) {
      result = result.filter(photo => 
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterTag && filterTag !== "all") {
      result = result.filter(photo => 
        photo.tags?.includes(filterTag)
      );
    }
    
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredPhotos(result);
  }, [photos, searchQuery, sortBy, filterTag]);

  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags || [])));

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold">My Gallery</h1>
            <div className="flex items-center gap-2">
              <Link to="/upload">
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New
                </Button>
              </Link>
              <Link to="/spreadsheets">
                <Button variant="secondary" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Spreadsheets
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search photos, tags or descriptions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterTag("all")}>
                  All photos
                </DropdownMenuItem>
                {allTags.map(tag => (
                  <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="photo-card animate-pulse">
                <div className="aspect-square w-full bg-muted"></div>
                <div className="p-3">
                  <div className="mb-2 h-5 w-2/3 rounded bg-muted"></div>
                  <div className="h-4 w-1/3 rounded bg-muted"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <ShareDialog
                      title={photo.title}
                      description={photo.description}
                      imageUrl={photo.url}
                      trigger={
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-background/30 text-white backdrop-blur-sm hover:bg-background/50">
                          <Share className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{photo.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(photo.uploadDate).toLocaleDateString()}
                  </p>
                  {photo.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {photo.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted bg-card py-16">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No photos found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery || filterTag !== "all" 
                ? "Try changing your search or filter criteria" 
                : "Upload your first photo to get started"}
            </p>
            {!searchQuery && filterTag === "all" && (
              <Link to="/upload">
                <Button>Upload Photo</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
