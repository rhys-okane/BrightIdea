import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { useCallback, useState, type FC } from "react";
import { AuthComponent } from "../design-picker/components/auth/AuthComponent";
import { useUserState } from "@src/store/hooks/UseUserState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@src/components/ui/dialog";
import { Button } from "@src/components/ui/button";
import { DropzoneEmptyState, DropzoneContent, Dropzone } from "@src/components/ui/dropzone";
import { apiUploadDesignMedia } from "@src/lib/api/UploadDesignMedia";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import { TrashIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Card, CardContent } from "@src/components/ui/card";
import { useViewingMediaForDesignState } from "@src/store/hooks/UseViewingMediaForDesignState";
import { apiDeleteDesignMediaFile } from "@src/lib/api/DeleteDesignMedia";
import { CautionDialog } from "../design-editor/components/CautionDialog";

interface Props {
  design: PlayableDesign;
}

export const ViewMedia: FC<Props> = ({ design }) => {
  const [user] = useUserState();
  const { getAccessTokenSilently } = useAuth0();
  const [file, setFile] = useState<File | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [, setViewingMediaForDesign] = useViewingMediaForDesignState();

  const goBack = useCallback(() => {
    setViewingMediaForDesign(undefined);
  }, [setViewingMediaForDesign]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !user || isCallingApi) return;

    const toastId = toast.loading("Uploading video...", { autoClose: false });

    setIsCallingApi(true);
    try {
      const fileName = await apiUploadDesignMedia(file, design, await getAccessTokenSilently());
      toast.update(toastId, {
        render: "Video uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      setDialogOpen(false);
      setFile(undefined);
      setViewingMediaForDesign({
        ...design,
        mediaFileNames: [...design.mediaFileNames, fileName],
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.update(toastId, {
        render: "Failed to upload media.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsCallingApi(false);
    }
  }, [file, user, isCallingApi, design, getAccessTokenSilently, setViewingMediaForDesign]);

  const handleAdminDelete = useCallback(
    async (fileName: string) => {
      if (!user || isCallingApi) return;

      const toastId = toast.loading("Deleting video...", { autoClose: false });

      setIsCallingApi(true);
      try {
        await apiDeleteDesignMediaFile(design, fileName, await getAccessTokenSilently());
        toast.update(toastId, {
          render: "Video deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        setDialogOpen(false);
        setFile(undefined);
        setViewingMediaForDesign({
          ...design,
          mediaFileNames: design.mediaFileNames.filter((name) => name !== fileName),
        });
      } catch (error) {
        console.error("Error deleting video:", error);
        toast.update(toastId, {
          render: "Failed to delete video.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      } finally {
        setIsCallingApi(false);
      }
    },
    [design, getAccessTokenSilently, isCallingApi, setViewingMediaForDesign, user]
  );

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full gap-4">
      <AuthComponent />
      <header className="text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Bright Idea</h1>
        <p className="text-lg text-gray-400">
          Videos for <b>{design.name}</b>
        </p>
      </header>

      {user?.role === "Admin" && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Upload</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Upload Video</DialogTitle>
              <DialogDescription>
                Upload a video for this design.
                <br />
                Supported formats: MP4, MOV, AVI.
              </DialogDescription>
            </DialogHeader>
            <Dropzone
              accept={{ "video/*": [".mp4", ".mov", ".avi"] }}
              onDrop={handleDrop}
              onError={console.error}
              src={file ? [file] : []}
              multiple={false}
            >
              <DropzoneEmptyState />
              <DropzoneContent>
                {file && (
                  <div className="max-h-[60vh] w-full">
                    <button onClick={() => setFile(undefined)} className="p-4 text-sm absolute top-0 right-0">
                      <TrashIcon />
                    </button>
                    <video src={URL.createObjectURL(file)} className="h-full w-full object-contain" controls />
                  </div>
                )}
              </DropzoneContent>
            </Dropzone>

            <DialogFooter>
              <Button onClick={handleUpload} disabled={isCallingApi}>
                {isCallingApi ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <section className="w-full flex items-center justify-center gap-4 flex-wrap max-w-[1400px]">
        {design.mediaFileNames.length === 0 && (
          <p className="text-gray-400 mt-8 text-center">
            No videos uploaded for this design yet.
            <br />
            Ask an Admin to upload one!
          </p>
        )}

        {design.mediaFileNames.map((mediaFileName) => (
          <Card key={mediaFileName}>
            <CardContent className="flex justify-stretch w-full h-full gap-2 flex-col">
              <video
                className="aspect-video object-contain max-w-96 max-h-54 w-full h-full"
                src={`${import.meta.env.VITE_MEDIA_CONTAINER_URL}/${design.id}/${mediaFileName}`}
                controls
              />
              {user?.role === "Admin" && (
                <CautionDialog
                  title="Delete Video?"
                  description="Are you sure you want to delete this video? This action cannot be undone."
                  onConfirm={async () => await handleAdminDelete(mediaFileName)}
                >
                  <button
                    className="hover:cursor-pointer disabled:cursor-progress disabled:bg-red-400 justify-self-end bg-red-500 hover:bg-red-600 transition-colors rounded py-2 px-4"
                    disabled={isCallingApi}
                  >
                    Delete
                  </button>
                </CautionDialog>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <button
        className="absolute top-0 left-0 m-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition cursor-pointer"
        onClick={goBack}
      >
        Back
      </button>
    </main>
  );
};
