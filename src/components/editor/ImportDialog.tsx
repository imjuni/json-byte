import { useCallback, useRef, useState } from 'react';

import { Upload } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { useXyFlowBuilder } from '#/hooks/useXyFlowBuilder';
import { useEditorStore } from '#/stores/editorStore';

export const ImportDialog = () => {
  const intl = useIntl();
  const { setContent } = useEditorStore();
  const { updateFromContent } = useXyFlowBuilder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      const text = await selectedFile.text();

      // Try to parse as JSON to validate
      const parsed = JSON.parse(text);

      // If successful, update editor content and visualization
      const formattedJson = JSON.stringify(parsed, null, 2);
      setContent(formattedJson);
      updateFromContent(formattedJson);

      // Close dialog and reset state
      setIsOpen(false);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON file');
    }
  }, [selectedFile, setContent, updateFromContent]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload /> Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{intl.$t({ id: 'graph.import-dialog.title' })}</DialogTitle>
          <DialogDescription>{intl.$t({ id: 'graph.import-dialog.description' })}</DialogDescription>
        </DialogHeader>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Tabs defaultValue="file-upload">
            <TabsList>
              <TabsTrigger value="file-upload">File Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="file-upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload JSON File</CardTitle>
                  <CardDescription>
                    Select a JSON file to visualize. The file will be parsed and displayed in the editor.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="file-upload">JSON File</Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        accept=".json,application/json"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                        type="file"
                      />
                      <Input
                        readOnly
                        className="flex-1"
                        placeholder="No file selected"
                        value={selectedFile?.name ?? ''}
                      />
                      <Button onClick={handleBrowseClick} type="button" variant="outline">
                        Browse
                      </Button>
                    </div>
                  </div>
                  {error != null && <div className="text-sm text-red-500">{error}</div>}
                </CardContent>
                <CardFooter>
                  <Button disabled={!selectedFile} onClick={handleFileUpload}>
                    Upload
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="url">
              <Card>
                <CardHeader>
                  <CardTitle>Import from URL</CardTitle>
                  <CardDescription>Enter a URL to fetch JSON data from a remote source.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="url-input">URL</Label>
                    <Input id="url-input" placeholder="https://example.com/data.json" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled>Fetch (Coming Soon)</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {intl.$t({ id: 'graph.import-dialog.action-close' })}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
