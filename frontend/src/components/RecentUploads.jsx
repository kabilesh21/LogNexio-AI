import React from 'react';
import { FileText, Copy, Check, Eye } from 'lucide-react';

export default function RecentUploads({ uploads, onCopyToClipboard, copiedId }) {
  
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col gap-4">
        {/* Card Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Recent Uploads</h2>
            <p className="text-xs text-background-muted mt-0.5">Logs currently cached in this pipeline session</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300 border border-background-border">
            Total: {uploads.length}
          </span>
        </div>

        {uploads.length === 0 ? (
          <div className="border border-dashed border-background-border/60 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
            <FileText className="w-10 h-10 text-slate-700 animate-pulse-slow" />
            <p className="text-sm font-semibold text-slate-400">No logs uploaded yet</p>
            <p className="text-xs text-background-muted max-w-[200px]">Upload .log or .txt files to initialize the history log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {/* Desktop Table View */}
            <table className="min-w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-background-border text-slate-400 text-xs font-semibold">
                  <th className="py-3 px-2">Filename</th>
                  <th className="py-3 px-2">Lines</th>
                  <th className="py-3 px-2">Size</th>
                  <th className="py-3 px-2">File UUID</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-border/40 text-xs">
                {uploads.map((item) => (
                  <tr key={item.file_id} className="hover:bg-slate-800/30 transition-all text-slate-300">
                    <td className="py-3.5 px-2 font-medium text-white max-w-[180px] truncate" title={item.original_name}>
                      {item.original_name}
                    </td>
                    <td className="py-3.5 px-2 font-mono-code text-accent font-semibold">
                      {item.total_lines.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2 text-background-muted">
                      {formatBytes(item.size)}
                    </td>
                    <td className="py-3.5 px-2 font-mono-code text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[110px] text-slate-500">{item.file_id}</span>
                        <button
                          onClick={() => onCopyToClipboard(item.file_id)}
                          className="text-slate-600 hover:text-primary transition-all p-1 hover:bg-slate-800 rounded"
                          title="Copy UUID to clipboard"
                        >
                          {copiedId === item.file_id ? (
                            <Check className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 border border-accent/20 text-accent capitalize">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile/Tablet Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {uploads.map((item) => (
                <div key={item.file_id} className="border border-background-border/60 bg-slate-800/20 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-white text-xs truncate max-w-[200px]" title={item.original_name}>
                      {item.original_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-accent/10 border border-accent/20 text-accent capitalize">
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-background-muted border-t border-background-border/40 pt-2 font-mono-code">
                    <div>
                      Lines: <strong className="text-accent">{item.total_lines.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      Size: <strong className="text-slate-300">{formatBytes(item.size)}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-900 mt-1">
                    <span className="text-[9px] text-slate-500 truncate font-mono-code max-w-[180px]">{item.file_id}</span>
                    <button
                      onClick={() => onCopyToClipboard(item.file_id)}
                      className="text-slate-500 hover:text-white transition-all p-1"
                    >
                      {copiedId === item.file_id ? (
                        <Check className="w-3 h-3 text-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
