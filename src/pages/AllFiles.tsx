
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { FileUploadList } from "@/components/FileUploadList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AllFiles = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">All Files</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              View and manage all your uploaded files in one place. You can preview, download, or delete your files.
            </p>
            <FileUploadList />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AllFiles;
