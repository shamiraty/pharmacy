import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 10 }: TableSkeletonProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {[...Array(columns)].map((_, i) => (
                            <th key={i} className="text-left py-4 px-6">
                                <Skeleton className="h-4 w-24" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(rows)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            {[...Array(columns)].map((_, j) => (
                                <td key={j} className="py-4 px-6">
                                    <div className="space-y-2">
                                        <Skeleton className={`h-4 ${j === 0 ? 'w-32' : 'w-20'}`} />
                                        {j === 0 && <Skeleton className="h-3 w-16" />}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
