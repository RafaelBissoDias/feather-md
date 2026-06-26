import { FolderOpen, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface FolderPermissionDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const CAN = [
  'Read and write .md files inside the chosen folder',
  'Create and delete files inside the chosen folder',
  'List file names in that folder',
]

const CANNOT = [
  'Access files outside the chosen folder',
  'Send your files to any server',
  'Access your computer without your action',
]

export function FolderPermissionDialog({
  open,
  onConfirm,
  onCancel,
}: FolderPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="size-5 text-primary" />
          </div>
          <DialogTitle>Folder access request</DialogTitle>
          <DialogDescription>
            FeatherMD will ask your browser to access a folder on your computer.
            Your browser will show a native folder picker next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-1.5 font-medium text-foreground">This app will be able to:</p>
            <ul className="space-y-1">
              {CAN.map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1.5 font-medium text-foreground">This app cannot:</p>
            <ul className="space-y-1">
              {CANNOT.map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <FolderOpen className="size-4" />
            Choose folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
