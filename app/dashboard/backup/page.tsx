'use client';

import { useState, useEffect } from 'react';
import { Database, Download, RotateCcw, AlertTriangle, FileText, Loader2, HardDrive, ShieldAlert, Trash2, Eye, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import Swal from 'sweetalert2';
import { isAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Backup {
    name: string;
    size: number;
    created: string;
    path: string;
}

export default function BackupPage() {
    const router = useRouter();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [previewData, setPreviewData] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const admin = await isAdmin();
            if (!admin) {
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'Only administrators can access backups.',
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push('/dashboard');
                return;
            }
            setUserIsAdmin(true);
            fetchBackups();
        };
        checkAccess();
    }, []);

    if (!userIsAdmin && loading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
    if (!userIsAdmin) return null; // Or access denied component


    const fetchBackups = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/backup');
            const data = await res.json();
            if (data.success) {
                setBackups(data.backups);
            }
        } catch (error) {
            console.error('Failed to fetch backups:', error);
            Swal.fire('Error', 'Failed to load backups list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            setCreating(true);

            // Simulate progress for better UX
            Swal.fire({
                title: 'Creating Backup...',
                html: 'Please wait while we secure your data.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const res = await fetch('/api/backup', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                await fetchBackups();
                Swal.fire('Success', 'Backup created successfully!', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Failed to create backup', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = (filename: string) => {
        const link = document.createElement('a');
        link.href = `/api/backup/download?filename=${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRestore = async (filename: string) => {
        const result = await Swal.fire({
            title: 'Are you absolutely sure?',
            html: `
        <div class="text-left text-sm text-gray-600">
          <p class="mb-2">You are about to restore: <strong>${filename}</strong></p>
          <div class="bg-red-50 border border-red-100 p-3 rounded-lg mb-4">
            <p class="text-red-800 font-bold flex items-center gap-2">
              <span class="text-lg">⚠️</span> WARNING: DATA LOSS
            </p>
            <p class="text-red-700 mt-1">
              This action will <strong>PERMANENTLY OVERWRITE</strong> your current database. 
              Any data added since this backup was created will be lost forever.
            </p>
          </div>
          <p>We recommend creating a new backup of your current data before proceeding.</p>
        </div>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Restore Database',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setRestoring(true);
                Swal.fire({
                    title: 'Restoring Database...',
                    text: 'Do not close this window.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const res = await fetch('/api/backup/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename })
                });
                const data = await res.json();

                if (data.success) {
                    await Swal.fire({
                        title: 'Restored!',
                        text: 'System restored successfully. The page will now reload.',
                        icon: 'success'
                    });
                    window.location.reload();
                } else {
                    throw new Error(data.error);
                }
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Failed to restore backup', 'error');
            } finally {
                setRestoring(false);
            }
        }
    };

    const handleDelete = async (filename: string) => {
        const result = await Swal.fire({
            title: 'Delete Backup?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/backup/delete?filename=${filename}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    await fetchBackups();
                    Swal.fire('Deleted!', 'Your backup has been deleted.', 'success');
                } else {
                    throw new Error(data.error);
                }
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Failed to delete backup', 'error');
            }
        }
    };

    const handleView = async (filename: string) => {
        try {
            setPreviewLoading(true);
            setShowPreview(true);
            const res = await fetch(`/api/backup/preview?filename=${filename}`);
            const data = await res.json();
            if (data.success) {
                setPreviewData({ ...data.stats, filename });
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            setShowPreview(false);
            Swal.fire('Error', error.message || 'Failed to load preview', 'error');
        } finally {
            setPreviewLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const autoBackup = backups.find(b => b.name === 'auto_backup.db');
    const manualBackups = backups.filter(b => b.name !== 'auto_backup.db');

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBackups = manualBackups.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(manualBackups.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        System Backup & Restore
                    </h1>
                    <p className="text-gray-600 mt-1">Manage Backups</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating || restoring}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating Backup...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Create New Backup
                        </>
                    )}
                </button>
            </div>

            {/* Auto Backup Card */}
            {autoBackup && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Database className="w-32 h-32 text-purple-600" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <RotateCcw className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Automatic System Backup
                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-200">
                                        Daily
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    System automatically creates this backup daily. It contains the latest data from today.
                                </p>
                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
                                        <FileText className="w-4 h-4" />
                                        {formatSize(autoBackup.size)}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
                                        <Loader2 className="w-4 h-4" />
                                        Last Updated: {formatDate(autoBackup.created)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleView(autoBackup.name)}
                                className="px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 font-medium text-sm flex items-center gap-2 shadow-sm"
                            >
                                <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                                onClick={() => handleDownload(autoBackup.name)}
                                className="px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 font-medium text-sm flex items-center gap-2 shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Save
                            </button>
                            <button
                                onClick={() => handleRestore(autoBackup.name)}
                                disabled={restoring}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4" /> Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <HardDrive className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-blue-900">Data Safety Info</h3>
                    <p className="text-blue-700 mt-1">
                        Backups are stored locally on the server. Regularly creating backups ensures you can recover your data in case of system failure or accidental deletion.
                        Always create a backup before performing major system updates or restorations.
                    </p>
                </div>
            </div>

            {/* Manual Backups List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Manual Backups History</h2>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {manualBackups.length} Files
                    </span>
                </div>

                {loading ? (
                    <TableSkeleton columns={5} rows={3} />
                ) : manualBackups.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No manual backups found</p>
                        <p className="text-sm">Create your first backup to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-gray-300">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700 font-semibold border-b-2 border-gray-300 shadow-sm">
                                <tr>
                                    <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Backup Name</th>
                                    <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Location</th>
                                    <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Date Created</th>
                                    <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Size</th>
                                    <th className="py-3 px-4 border border-gray-300 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBackups.map((backup, index) => (
                                    <tr key={index} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                        <td className="py-3 px-4 border border-gray-300">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Database className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{backup.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 border border-gray-300 text-gray-500 font-mono text-xs max-w-[200px] truncate" title={backup.path}>
                                            {backup.path}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 border border-gray-300">
                                            {formatDate(backup.created)}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 font-mono border border-gray-300">
                                            {formatSize(backup.size)}
                                        </td>
                                        <td className="py-3 px-4 text-right border border-gray-300">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(backup.name)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm"
                                                    title="View contents"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(backup.name)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm"
                                                    title="Download to computer"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(backup.name)}
                                                    disabled={creating || restoring}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Restore this backup"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(backup.name)}
                                                    disabled={creating || restoring}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete this backup"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {!loading && manualBackups.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, manualBackups.length)}</span> of <span className="font-medium">{manualBackups.length}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Backup Preview</h3>
                                <p className="text-sm text-gray-500 mt-1">{previewData?.filename || 'Loading...'}</p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {previewLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
                                    <p>Analyzing backup contents...</p>
                                </div>
                            ) : previewData ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="text-sm text-blue-600 font-medium mb-1">Total Sales</div>
                                        <div className="text-2xl font-bold text-blue-900">{previewData.sales}</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <div className="text-sm text-green-600 font-medium mb-1">Total Revenue</div>
                                        <div className="text-2xl font-bold text-green-900">
                                            {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(previewData.totalRevenue)}
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <div className="text-sm text-purple-600 font-medium mb-1">Medicines</div>
                                        <div className="text-2xl font-bold text-purple-900">{previewData.medicines}</div>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <div className="text-sm text-amber-600 font-medium mb-1">Users</div>
                                        <div className="text-2xl font-bold text-amber-900">{previewData.users}</div>
                                    </div>
                                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                                        <div className="text-sm text-rose-600 font-medium mb-1">Suppliers</div>
                                        <div className="text-2xl font-bold text-rose-900">{previewData.suppliers}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <div className="text-sm text-indigo-600 font-medium mb-1">Purchases</div>
                                        <div className="text-2xl font-bold text-indigo-900">{previewData.purchases}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-500 py-8">
                                    Failed to load preview data
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
