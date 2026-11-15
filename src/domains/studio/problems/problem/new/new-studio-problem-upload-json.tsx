"use client";

import { useState } from "react";
import type { AnyFormApi } from "@tanstack/react-form";
import type { Track } from "@/domains/game/models/track";
import { Button } from "@/shared/components/ui/button";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import NewStudioProblemUploadJsonContent from "./new-studio-problem-upload-json-content";
import { useUploadStudioProblemJson } from "./use-upload-studio-problem-json";

type NewStudioProblemUploadJSONProps = {
  form: AnyFormApi;
  availableTracks: Track[];
};

const title = "Upload a problem via JSON";
const description =
  "Paste JSON describing the problem's title, question, difficulty, limits, track, and tags.";

export default function NewStudioProblemUploadJSON({
  form,
  availableTracks,
}: Readonly<NewStudioProblemUploadJSONProps>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { text, setText, promptTemplate, handleUpload } =
    useUploadStudioProblemJson({
      form,
      availableTracks,
      onUploaded: () => {
        setDialogOpen(false);
        setDrawerOpen(false);
      },
    });

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="hidden md:inline-flex"
          >
            <Upload className="me-1" />
            Upload JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <NewStudioProblemUploadJsonContent
            text={text}
            onTextChange={setText}
            availableTracks={availableTracks}
            promptTemplate={promptTemplate}
          />
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!text.trim()}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button type="button" variant="secondary" className="md:hidden">
            <Upload className="me-1" />
            Upload JSON
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <NewStudioProblemUploadJsonContent
              text={text}
              onTextChange={setText}
              availableTracks={availableTracks}
              promptTemplate={promptTemplate}
            />
          </div>
          <DrawerFooter className="shrink-0">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!text.trim()}
            >
              Upload
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
