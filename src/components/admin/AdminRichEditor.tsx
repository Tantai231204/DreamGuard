import { memo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/lib/utils';
import { Type, Sparkles, Code2 } from 'lucide-react';

interface AdminRichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'clean'],
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
];

const AdminRichEditor = memo(function AdminRichEditor({
    value,
    onChange,
    placeholder = "Start drafting your premium content...",
    disabled = false,
    className
}: AdminRichEditorProps) {
    
    return (
        <div className={cn("flex flex-col border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden", className)}>
            {/* Header info */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#4988c4]">
                    <Sparkles size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Premium Content Editor</h4>
                </div>
                <div className="flex items-center gap-2 opacity-30">
                    <Code2 size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">HTML Support Enabled</span>
                </div>
            </div>

            <div className="quill-editor-container">
                <ReactQuill 
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={disabled}
                    className="admin-quill-editor"
                />
            </div>

            {/* Custom Styling for the editor to match our luxury theme */}
            <style>{`
                .admin-quill-editor {
                    border: none !important;
                }
                .admin-quill-editor .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    background: #f8fafc !important;
                    padding: 8px 16px !important;
                }
                .admin-quill-editor .ql-container {
                    border: none !important;
                    font-family: inherit !important;
                    font-size: 15px !important;
                    min-height: 250px !important;
                    max-height: 500px !important;
                    overflow-y: auto !important;
                }
                .admin-quill-editor .ql-editor {
                    padding: 20px !important;
                    line-height: 1.6 !important;
                    color: #334155 !important;
                }
                .admin-quill-editor .ql-editor.ql-blank::before {
                    color: #94a3b8 !important;
                    font-style: italic !important;
                    left: 20px !important;
                }
                /* Luxury button styling */
                .ql-snow.ql-toolbar button:hover,
                .ql-snow .ql-toolbar button:hover,
                .ql-snow.ql-toolbar button.ql-active,
                .ql-snow .ql-toolbar button.ql-active {
                    color: #4988c4 !important;
                }
                .ql-snow.ql-toolbar button:hover .ql-stroke,
                .ql-snow .ql-toolbar button:hover .ql-stroke,
                .ql-snow.ql-toolbar button.ql-active .ql-stroke,
                .ql-snow .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #4988c4 !important;
                }
                .ql-snow.ql-toolbar button:hover .ql-fill,
                .ql-snow .ql-toolbar button:hover .ql-fill,
                .ql-snow.ql-toolbar button.ql-active .ql-fill,
                .ql-snow .ql-toolbar button.ql-active .ql-fill {
                    fill: #4988c4 !important;
                }
            `}</style>

            {/* Editor Footer Info */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Type size={12} /> {value?.length || 0} characters</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                    <Sparkles size={12} /> Auto-save active
                </div>
            </div>
        </div>
    );
});

export default AdminRichEditor;
