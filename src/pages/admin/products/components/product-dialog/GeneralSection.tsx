import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SectionHeading from '../shared/SectionHeading';
import { INPUT_CLS, TEXTAREA_CLS } from './constants';

interface GeneralSectionProps {
    name: string;
    slug: string;
    summary: string;
    description: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
}

const GeneralSection = memo(function GeneralSection({
    name, slug, summary, description,
    isLoading,
    onNameChange, onSlugChange, onSummaryChange, onDescriptionChange,
}: GeneralSectionProps) {
    return (
        <section className="space-y-4">
            <SectionHeading title="General" />

            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Cloud Mattress"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        disabled={isLoading}
                        className={INPUT_CLS}
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                        URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="slug"
                        placeholder="cloud-mattress"
                        value={slug}
                        onChange={(e) => onSlugChange(e.target.value)}
                        disabled={isLoading}
                        className={cn(INPUT_CLS, 'font-mono text-sm')}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                    Summary <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="summary"
                    placeholder="Brief one-line product summary"
                    value={summary}
                    onChange={(e) => onSummaryChange(e.target.value)}
                    disabled={isLoading}
                    className={INPUT_CLS}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="description"
                    placeholder="Detailed product description..."
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className={TEXTAREA_CLS}
                />
            </div>
        </section>
    );
});

export default GeneralSection;
