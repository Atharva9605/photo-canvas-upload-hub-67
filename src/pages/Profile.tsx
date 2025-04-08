
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileImage, Settings, Upload, User } from "lucide-react";

interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  thumbnailUrl: string;
  tags: string[];
}

const Profile = () => {
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    language: "English",
    theme: "light",
    autoAnalyze: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    // Simulate fetching user data and upload history
    setTimeout(() => {
      const mockHistory: UploadHistoryItem[] = [
        {
          id: "1",
          fileName: "business_document.jpg",
          fileType: "image/jpeg",
          fileSize: "2.4 MB",
          uploadDate: "2025-04-07T14:32:10Z",
          thumbnailUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
          tags: ["document", "text", "business"],
        },
        {
          id: "2",
          fileName: "vacation_photo.jpg",
          fileType: "image/jpeg",
          fileSize: "3.8 MB",
          uploadDate: "2025-04-06T10:15:22Z",
          thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          tags: ["photo", "landscape", "beach"],
        },
        {
          id: "3",
          fileName: "sketch_design.png",
          fileType: "image/png",
          fileSize: "1.2 MB",
          uploadDate: "2025-04-05T09:45:18Z",
          thumbnailUrl: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e",
          tags: ["drawing", "sketch", "design"],
        },
        {
          id: "4",
          fileName: "notes.jpg",
          fileType: "image/jpeg",
          fileSize: "0.9 MB",
          uploadDate: "2025-04-04T16:20:33Z",
          thumbnailUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db",
          tags: ["document", "notes", "text"],
        },
      ];
      
      setUploadHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePreferenceChange = (key: string, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">User Profile</h1>
        
        <div className="mx-auto max-w-4xl">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>John Doe</CardTitle>
                  <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New
                </Link>
              </Button>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="uploads" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="uploads" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                My Uploads
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="uploads" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Upload History</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse rounded-lg border p-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 rounded bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                          <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {uploadHistory.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="flex items-start p-4">
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.fileName}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.fileName}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <p className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />{formatDate(item.uploadDate)}
                            </p>
                            <p>{item.fileSize} • {item.fileType.split('/')[1].toUpperCase()}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={userPreferences.language}
                        onChange={(e) => handlePreferenceChange("language", e.target.value)}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Chinese</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={userPreferences.theme}
                        onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                      >
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Analyze Uploads</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically analyze files when uploaded
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={userPreferences.autoAnalyze}
                          onChange={(e) => handlePreferenceChange("autoAnalyze", e.target.checked)}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your uploads
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={userPreferences.notificationsEnabled}
                          onChange={(e) => handlePreferenceChange("notificationsEnabled", e.target.checked)}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
