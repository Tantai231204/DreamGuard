import { memo } from 'react';
import type { ComboFormFieldsProps } from './combo-form.types';
import { VariantLayout, ParentLayout } from './layouts';

/**
 * ComboFormFields - Mode Router
 * 
 * High-level router that delegates rendering to specialized layouts based on 'mode'.
 */
const ComboFormFields = memo(function ComboFormFields(props: ComboFormFieldsProps) {
    if (props.mode === 'variant') {
        return <VariantLayout {...props} />;
    }
    return <ParentLayout {...props} />;
});

export default ComboFormFields;