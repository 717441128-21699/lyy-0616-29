import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  Image as ImageIcon,
  FolderPlus,
} from 'lucide-react';
import type { DocumentType, UploadedDocument } from '@/types';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { formatFileSize, getDocumentTypeConfig } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  processId: string;
}

interface UploadZone {
  type: DocumentType;
  icon: typeof FileText;
  hint: string;
  accept: string;
}

const uploadZones: UploadZone[] = [
  {
    type: 'ID_CARD_FRONT',
    icon: UserCheck,
    hint: '请上传身份证正面照（人像面）',
    accept: 'image/jpeg,image/png,image/jpg',
  },
  {
    type: 'ID_CARD_BACK',
    icon: FileText,
    hint: '请上传身份证背面照（国徽面）',
    accept: 'image/jpeg,image/png,image/jpg',
  },
  {
    type: 'DIPLOMA',
    icon: GraduationCap,
    hint: '请上传学历证书扫描件或照片',
    accept: 'image/jpeg,image/png,image/jpg,application/pdf',
  },
  {
    type: 'PHOTO',
    icon: ImageIcon,
    hint: '请上传一寸免冠证件照',
    accept: 'image/jpeg,image/png,image/jpg',
  },
  {
    type: 'OTHER',
    icon: FolderPlus,
    hint: '其他补充材料（可选）',
    accept: 'image/jpeg,image/png,image/jpg,application/pdf,.doc,.docx',
  },
];

export function DocumentUploader({ processId }: DocumentUploaderProps) {
  const getDocumentsForProcess = useOnboardingStore((s) => s.getDocumentsForProcess);
  const uploadDocument = useOnboardingStore((s) => s.uploadDocument);
  const removeDocument = useOnboardingStore((s) => s.removeDocument);
  const documents = getDocumentsForProcess(processId);

  const [draggedType, setDraggedType] = useState<DocumentType | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const getDocByType = useCallback(
    (type: DocumentType) => documents.find((d) => d.type === type),
    [documents],
  );

  const handleDragOver = (e: React.DragEvent, type: DocumentType) => {
    e.preventDefault();
    setDraggedType(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedType(null);
  };

  const handleFileUpload = useCallback(
    (type: DocumentType, file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        uploadDocument(processId, {
          type,
          fileName: file.name,
          fileSize: file.size,
          previewUrl: file.type.startsWith('image/') ? (reader.result as string) : undefined,
        });
      };
      reader.readAsDataURL(file);
    },
    [processId, uploadDocument],
  );

  const handleDrop = (e: React.DragEvent, type: DocumentType) => {
    e.preventDefault();
    setDraggedType(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(type, file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(type, file);
    if (fileInputsRef.current[type]) {
      fileInputsRef.current[type]!.value = '';
    }
  };

  const openFileDialog = (type: DocumentType) => {
    fileInputsRef.current[type]?.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
            <Upload className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">材料上传</h2>
            <p className="text-sm text-neutral-500">
              已上传 {documents.filter((d) => d.type !== 'OTHER').length} / 4 项必填材料
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {uploadZones.map((zone, index) => {
          const config = getDocumentTypeConfig(zone.type);
          const uploaded = getDocByType(zone.type);
          const isDragging = draggedType === zone.type;
          const Icon = zone.icon;

          return (
            <motion.div
              key={zone.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={cn(
                'relative rounded-xl border-2 border-dashed transition-all overflow-hidden',
                uploaded
                  ? 'border-accent-300 bg-accent-50/50'
                  : isDragging
                    ? 'border-primary-500 bg-primary-50 scale-[1.01] shadow-glow-primary'
                    : 'border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/40',
              )}
              onDragOver={(e) => handleDragOver(e, zone.type)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone.type)}
            >
              <input
                ref={(el) => {
                  fileInputsRef.current[zone.type] = el;
                }}
                type="file"
                accept={zone.accept}
                className="hidden"
                onChange={(e) => handleFileSelect(e, zone.type)}
              />

              <AnimatePresence mode="wait">
                {uploaded ? (
                  <motion.div
                    key="uploaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 md:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        {uploaded.previewUrl ? (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                            <img
                              src={uploaded.previewUrl}
                              alt={uploaded.fileName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-primary-400" />
                          </div>
                        )}
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn('text-sm font-semibold', config.className)}
                              >
                                {config.label}
                              </span>
                              {config.required && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 font-medium">
                                  必填
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-700 truncate font-medium">
                              {uploaded.fileName}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                              {formatFileSize(uploaded.fileSize)}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeDocument(uploaded.id)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-danger-50 text-neutral-400 hover:text-danger-500 transition-colors flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="button"
                    onClick={() => openFileDialog(zone.type)}
                    className="w-full p-5 md:p-6 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-colors',
                          isDragging
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-neutral-400 border border-neutral-200',
                        )}
                      >
                        <Icon className="w-6 h-6 md:w-7 md:h-7" />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={cn('text-sm font-semibold', config.className)}
                          >
                            {config.label}
                          </span>
                          {config.required ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 font-medium">
                              必填
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium">
                              可选
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mb-2">{zone.hint}</p>
                        <div className="inline-flex items-center gap-1.5 text-xs text-primary-500 font-medium">
                          <Upload className="w-3.5 h-3.5" />
                          点击或拖拽文件到此处上传
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
        <p className="text-xs text-neutral-500 flex items-start gap-2">
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400" />
          <span>
            支持的格式：JPG、PNG、PDF 等；单个文件大小不超过 10MB。为保证识别效果，请上传清晰的扫描件或照片。
          </span>
        </p>
      </div>
    </div>
  );
}
