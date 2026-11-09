// Upload/fila/lista adaptados de SupplierDocuments.tsx 8b5c9409; sem URL pública ou SDK de storage.
import {useState,useRef,useCallback,useEffect} from 'react';
import {Button} from '../../sge/components/ui/button.tsx';
import {Badge} from '../../sge/components/ui/badge.tsx';
import {Card,CardContent,CardHeader,CardTitle} from '../../sge/components/ui/card.tsx';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../../sge/components/ui/select.tsx';
import {toast} from 'sonner';
import {FileText,Upload,Download,Trash2,Plus,Calendar,AlertTriangle,File,FileImage,FileArchive,ChevronDown,ChevronUp,X,CheckCircle2,Loader2} from 'lucide-react';
import type {SupplierPrivateFile} from '../../../shared/suppliers/documents.ts';
interface SupplierDocumentsProps {records:SupplierPrivateFile[];canEdit:boolean;canReview:boolean;busy:boolean;maxBytes:number;previous?:SupplierPrivateFile;onUpload:(data:Record<string,unknown>)=>Promise<void>;onDownload:(id:string)=>void;onReview:(file:SupplierPrivateFile,action:string)=>void;onHistory:(file:SupplierPrivateFile)=>void;onVersion:(file:SupplierPrivateFile)=>void;onPendingChange:(value:boolean)=>void;}

interface FileWithPreview {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number | null;
  phase?: "reading" | "saving";
  qualificationKey: string;
  issuedAt: string;
  description: string;
  documentType: string;
  expiresAt: string;
  error?: string;
}

const typeLabels: Record<string, string> = {
  contract: "Contrato",
  certificate: "Certidão",
  invoice: "Nota Fiscal",
  license: "Licença",
  insurance: "Seguro",
  registration: "Registro",
  other: "Outro",
};

const typeColors: Record<string, string> = {
  contract: "bg-[oklch(0.90_0.03_250)] text-[oklch(0.35_0.10_250)]",
  certificate: "bg-green-100 text-green-800",
  invoice: "bg-purple-100 text-purple-800",
  license: "bg-[oklch(0.90_0.05_45)] text-[oklch(0.45_0.15_45)]",
  insurance: "bg-cyan-100 text-cyan-800",
  registration: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function SupplierDocuments({records,canEdit,canReview,busy,maxBytes,previous,onUpload,onDownload,onReview,onHistory,onVersion,onPendingChange}:SupplierDocumentsProps){
const isLoading=false;const documents=records.map(raw=>({document:{id:raw.id,name:raw.metadata.name,type:raw.metadata.documentType,fileName:raw.fileName,mimeType:raw.mimeType,expiresAt:raw.metadata.expiresAt?new Date(raw.metadata.expiresAt+'T23:59:59Z'):null,fileKey:raw.id,raw}}));
const uploadMutation={isPending:busy};
const handleDownload=(id:string)=>onDownload(id);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(()=>{onPendingChange(files.some(f=>f.status!=='success'));},[files]);
  // Drag and Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    if(previous&&(newFiles.length!==1||files.some(f=>f.status!=='success'))){toast.error("Selecione um arquivo por substituição de versão.");return;}
    const validFiles = newFiles.filter((file) => {
      const maxSize = maxBytes;
      if (file.size > maxSize) {
        toast.error(`Arquivo "${file.name}" excede o limite configurado`);
        return false;
      }
      return true;
    });

    const fileObjects: FileWithPreview[] = validFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
      progress: 0,
      documentType: previous?.metadata.documentType??"other",
      qualificationKey:previous?.metadata.qualificationKey??"",issuedAt:previous?.metadata.issuedAt??"",description:previous?.metadata.description??"",
      expiresAt: previous?.metadata.expiresAt??"",
    }));

    setFiles((prev) => [...prev, ...fileObjects]);
    if (!isUploadOpen) setIsUploadOpen(true);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileField = (id: string, field: keyof FileWithPreview, value: any) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const uploadFile = async (fileItem: FileWithPreview) => {
    updateFileField(fileItem.id, "status", "uploading");
    updateFileField(fileItem.id, "phase", "reading");
    updateFileField(fileItem.id, "error", "");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.onprogress=e=>{if(e.lengthComputable)updateFileField(fileItem.id,"progress",Math.round(e.loaded/e.total*100));};
      reader.readAsDataURL(fileItem.file);

      const base64Data = await base64Promise;
      updateFileField(fileItem.id, "phase", "saving");
      updateFileField(fileItem.id, "progress", null);

      await onUpload({requestId:fileItem.id,fileName:fileItem.name,mimeType:fileItem.type,contentBase64:base64Data,metadata:{name:fileItem.name.replace(/\.[^.]+$/,'')||fileItem.name,documentType:fileItem.documentType,qualificationKey:fileItem.qualificationKey,issuedAt:fileItem.issuedAt,expiresAt:fileItem.expiresAt,description:fileItem.description}});

      updateFileField(fileItem.id, "progress", 100);
      updateFileField(fileItem.id, "status", "success");
      toast.success(`"${fileItem.name}" enviado com sucesso!`);
    } catch (error: any) {
      updateFileField(fileItem.id, "status", "error");
      updateFileField(fileItem.id, "error", error.message || "Erro ao enviar arquivo");
      toast.error(`Erro ao enviar "${fileItem.name}"`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => (f.status === "pending" || f.status === "error"));
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const clearCompletedFiles = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "success"));
  };

  // Janela crítica: somente documentos com ≤15 dias para vencer
  const isExpiringSoon = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 15 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-8 w-8 text-muted-foreground" />;
    if (mimeType.startsWith("image/")) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive className="h-8 w-8 text-yellow-500" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const pendingCount = files.filter((f) => (f.status === "pending" || f.status === "error")).length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        {canEdit && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button" tabIndex={0} aria-label="Selecionar documentos privados" onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInputRef.current?.click();}}}
            onClick={e=>{if(e.target!==fileInputRef.current)fileInputRef.current?.click();}}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file" aria-label="Arquivos privados do fornecedor"
              multiple={!previous}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
            />
            <div className="flex flex-col items-center gap-2">
              <div className={`
                h-12 w-12 rounded-full flex items-center justify-center
                ${isDragging ? "bg-primary/20" : "bg-muted"}
              `}>
                <Upload className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? "Solte os arquivos aqui" : "Arraste e solte arquivos aqui"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou clique para selecionar (máximo {formatFileSize(maxBytes)})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Queue */}
        {files.length > 0 && (
          <section>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <>
                <Button variant="ghost" size="sm" className="gap-2" onClick={()=>setIsUploadOpen(v=>!v)}>
                  {isUploadOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-medium">
                    Fila de Upload ({files.length})
                    {successCount > 0 && (
                      <span className="text-green-600 ml-2">• {successCount} enviado{successCount > 1 ? "s" : ""}</span>
                    )}
                  </span>
                </Button>
              </>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCompletedFiles}>
                    Limpar enviados
                  </Button>
                )}
                {pendingCount > 0 && (
                  <Button size="sm" onClick={uploadAllFiles} disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Enviar {pendingCount}
                  </Button>
                )}
              </div>
            </div>
            <div hidden={!isUploadOpen} className="space-y-2 mt-2">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className={`
                    p-3 rounded-lg border
                    ${fileItem.status === "success" ? "border-green-200 bg-green-50/50" : ""}
                    ${fileItem.status === "error" ? "border-red-200 bg-red-50/50" : ""}
                    ${fileItem.status === "pending" || fileItem.status === "uploading" ? "border-border bg-card" : ""}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                      ${fileItem.status === "success" ? "bg-green-100" : ""}
                      ${fileItem.status === "error" ? "bg-red-100" : ""}
                      ${fileItem.status === "pending" || fileItem.status === "uploading" ? "bg-muted" : ""}
                    `}>
                      {fileItem.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : fileItem.status === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : fileItem.status === "uploading" ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{fileItem.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(fileItem.size)}</p>
                        </div>
                        {(fileItem.status === "pending" || fileItem.status === "error") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(fileItem.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {fileItem.status === "uploading" && (
                        <div><p>{fileItem.phase==="reading"?"Lendo arquivo":"Aguardando persistência no servidor"}</p><progress aria-label={"Leitura/envio "+fileItem.name} value={fileItem.phase==="reading"?fileItem.progress??undefined:undefined} max={100} className="h-1.5"/></div>
                      )}

                      {fileItem.status === "error" && fileItem.error && (
                        <p className="text-xs text-red-600">{fileItem.error}</p>
                      )}

                      {fileItem.status === "pending" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select
                              value={fileItem.documentType}
                              onValueChange={(value) => updateFileField(fileItem.id, "documentType", value)}
                            >
                              <SelectTrigger aria-label={"Tipo documental "+fileItem.name} disabled={!!previous} className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(typeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Validade
                            </Label>
                            <Input
                              type="date" aria-label={"Validade documental "+fileItem.name}
                              className="h-8 text-xs"
                              value={fileItem.expiresAt}
                              onChange={(e) => updateFileField(fileItem.id, "expiresAt", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                      {(fileItem.status==="pending"||fileItem.status==="error")&&<><label>Chave do requisito<Input aria-label={"Chave documental "+fileItem.name} disabled={!!previous} value={fileItem.qualificationKey} onChange={e=>updateFileField(fileItem.id,"qualificationKey",e.target.value)}/></label><label>Emissão<Input type="date" aria-label={"Emissão documental "+fileItem.name} value={fileItem.issuedAt} onChange={e=>updateFileField(fileItem.id,"issuedAt",e.target.value)}/></label><label>Descrição<Textarea aria-label={"Descrição documental "+fileItem.name} value={fileItem.description} onChange={e=>updateFileField(fileItem.id,"description",e.target.value)}/></label></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((item) => (
              <div
                key={item.document.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(item.document.mimeType)}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{item.document.name}</p>
                      <Badge className={typeColors[item.document.type] || typeColors.other}>
                        {typeLabels[item.document.type] || "Outro"}
                      </Badge>
                      {isExpired(item.document.expiresAt) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expirado
                        </Badge>
                      )}
                      {isExpiringSoon(item.document.expiresAt) && !isExpired(item.document.expiresAt) && (
                        <Badge variant="outline" className="text-[oklch(0.55_0.15_85)] border-[oklch(0.55_0.15_85)] text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expira em breve
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{item.document.fileName}</span>
                      {item.document.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expira: {new Date(item.document.expiresAt).toLocaleDateString("pt-BR",{timeZone:"UTC"})}
                        </span>
                      )}
                    </div>
                    <p>Versão {item.document.raw.version} · revisão {item.document.raw.revision} · {item.document.raw.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={"Baixar documento "+item.document.fileName+" v"+item.document.raw.version}
                    onClick={() => handleDownload(item.document.fileKey)}
                    disabled={busy}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button disabled={busy} onClick={()=>onHistory(item.document.raw)}>Histórico {item.document.fileName} v{item.document.raw.version}</Button><Button disabled={busy||!canEdit||records.some(f=>f.seriesId===item.document.raw.seriesId&&f.version>item.document.raw.version)} onClick={()=>onVersion(item.document.raw)}>Nova versão {item.document.fileName} v{item.document.raw.version}</Button>{canReview&&!records.some(f=>f.seriesId===item.document.raw.seriesId&&f.version>item.document.raw.version)&&<><Button disabled={busy||item.document.raw.status==="accepted"||item.document.raw.status==="archived"} onClick={()=>onReview(item.document.raw,"accept")}>Aceitar {item.document.fileName} v{item.document.raw.version}</Button><Button disabled={busy||item.document.raw.status==="rejected"||item.document.raw.status==="archived"} onClick={()=>onReview(item.document.raw,"reject")}>Rejeitar {item.document.fileName} v{item.document.raw.version}</Button>{item.document.raw.status==="archived"&&<Button disabled={busy} onClick={()=>onReview(item.document.raw,"restore")}>Restaurar {item.document.fileName} v{item.document.raw.version}</Button>}</>}
                  {canEdit&&!records.some(f=>f.seriesId===item.document.raw.seriesId&&f.version>item.document.raw.version) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      aria-label={"Arquivar documento "+item.document.fileName+" v"+item.document.raw.version} disabled={busy||!canReview||item.document.raw.status==="archived"}
                      onClick={() => onReview(item.document.raw,"archive")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

