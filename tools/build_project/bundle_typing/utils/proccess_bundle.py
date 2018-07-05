""" 
This util can fix up the type definitions for the library
It can remove definitions from the files that should not be there, for example imports with side effects.
With the --legacy flag It can also create global declarations from module declarations.
"""

import argparse
import re

def process(data):
    """ Clean file with es6 modules:
            - remove imports that cause side effects
    """
    rule_remove_side_effect_imports = re.compile(r'import [^{]')
    count_removed_lines = 0
    for index, line in enumerate(data):
        if any([
            rule_remove_side_effect_imports.search(line)
        ]):
            data[index] = ''
            count_removed_lines += 1
    print("INFO: The definition-file-bundler-util file-cleaner removed {} lines from the original bundled definitions file".format(count_removed_lines))
    return data

def process_legacy(data):
    """ 
        It assumes that:
            - the project has been bundled with dts-bundle.
            - the file is idented, and the top level close brackets can be removed, because only modules are in the top level, and they are removed as well.
    
        Rules to apply:
            - remove imports that cause side effects
            - remove inner module declarations
            - remove inner imports
            - remove top level close brackets
            - remove empty declarations
            - replace export to declare
    """
    rule_remove_side_effect_imports = re.compile(r'import [^{]')
    rule_remove_modules = re.compile(r'declare module')
    rule_remove_inner_import = re.compile(r'import {.*} from')
    rule_remove_inner_export = re.compile(r'export \* from')
    rule_remove_toplevel_closebracket = re.compile(r'^}')
    rule_remove_empty_block = re.compile(r'(declare|export) {}')
    rule_replace_exported_from = re.compile(r'export ')
    rule_replace_exported_to = 'declare '
    count_removed_lines = 0
    count_modified_lines = 0
    for index, line in enumerate(data):
        if any([
            rule_remove_side_effect_imports.search(line),
            rule_remove_modules.search(line),
            rule_remove_inner_import.search(line),
            rule_remove_inner_export.search(line),
            rule_remove_toplevel_closebracket.match(line),
            rule_remove_empty_block.search(line)
        ]):
            #print(line)
            count_removed_lines += 1
            data[index] = ''
        elif rule_replace_exported_from.search(line):
            data[index] = re.sub(rule_replace_exported_from, rule_replace_exported_to, line)
            count_modified_lines += 1
    print("INFO: The definition-file-bundler-util legacy support removed {} lines and modified {} lines from the original bundled definitions file".format(count_removed_lines, count_modified_lines))
    return data

def process_file(bundle, is_legacy):
    result = []
    with open(bundle, 'r') as definition_file:
        data = definition_file.readlines()
        if is_legacy:
            result = process_legacy(data)
        else:
            result = process(data)
    return result

def save_result(target, data):
    with open(target, 'w') as processed_file:
        processed_file.writelines(data)

def definitions_to_add(definition_path):
    """ Opens the file and appends its content to the processed data """
    data = []
    with open(definition_path, 'r') as typedefs:
        data = typedefs.readlines()
        print("INFO: {} lines have been added from the internal modules".format(len(data)))
    return data

def main(source, is_legacy, target, definition_path):
    """ 
    Opens the original typings and processes it with the appropriate version
    Appends the exposed declarations
    Saves the result 
    """
    data = process_file(source, is_legacy)
    data += definitions_to_add(definition_path)
    save_result(target, data)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Proccess typing bundle')
    parser.add_argument('bundle', type=str, help='filename of the original bundle')
    parser.add_argument('--target', type=str, help='filename of the target file (default is to overwrite)')
    parser.add_argument('--exposed_typings', type=str, help='path of the typing file that should be appendend to the result', default='types/miojs/index.d.ts')
    parser.add_argument('--legacy', action='store_true', help='only one file with global declarations')
    args = parser.parse_args()
    
    target = args.target if args.target else args.bundle

    try:
        main(args.bundle, args.legacy, target, args.exposed_typings)
    except IOError as error:
        print("ERROR: Could not process the bundled typing information, because could not find: '{}' \n...... maybe the typings have not been generated yet.".format(error.filename))