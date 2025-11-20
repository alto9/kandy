import * as yaml from 'js-yaml';

/**
 * Result of YAML syntax validation.
 * Provides detailed information about validation success or failure.
 */
export interface ValidationResult {
    /** Whether the YAML is syntactically valid */
    valid: boolean;
    /** Error message if validation failed */
    error?: string;
    /** Line number where the error occurred (0-based) */
    line?: number;
    /** Column number where the error occurred (0-based) */
    column?: number;
}

/**
 * Validates YAML syntax using js-yaml parser.
 * This function checks for basic YAML syntax errors before attempting
 * to apply changes to the Kubernetes cluster.
 * 
 * @param content - The YAML content to validate as a string
 * @returns ValidationResult with success status and error details if invalid
 * 
 * @example
 * ```typescript
 * const result = validateYAMLSyntax('apiVersion: v1\nkind: Pod');
 * if (!result.valid) {
 *   console.error(`YAML error at line ${result.line}: ${result.error}`);
 * }
 * ```
 */
export function validateYAMLSyntax(content: string): ValidationResult {
    try {
        // Attempt to parse the YAML content
        yaml.load(content);
        
        // If parsing succeeds, YAML is valid
        return {
            valid: true
        };
    } catch (error) {
        // Check if this is a YAMLException with line/column info
        if (error instanceof yaml.YAMLException) {
            return {
                valid: false,
                error: error.message,
                line: error.mark?.line,
                column: error.mark?.column
            };
        }
        
        // Handle other types of errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            valid: false,
            error: errorMessage
        };
    }
}

