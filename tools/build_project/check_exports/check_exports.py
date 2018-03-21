import os
import re
import json

def collect_folders(root_folder):
    """ Collect folders to check into a list"""
    return [os.path.join(root_folder, o) for o in os.listdir(root_folder) 
                                         if os.path.isdir(os.path.join(root_folder,o))]

def collect_files_from_folder(folder_name):
    """ Get the files from the folder """
    return os.listdir(folder_name)

def open_barrel(folder, filename):
    """ Get the exported content from the barrel """
    with open(os.path.join(folder, filename), 'r') as barrel_file:
        data = barrel_file.read()
        pattern = re.compile(r'export \* from [\'"]\./(.*)[\'"]')
        result = [match + ".ts" for match in re.findall(pattern, data)]
        return result

def compare_all_to_exported(filelist_a, filelist_b, barrel_name):
    """ Check the difference between the list of files """
    files_a = set(filelist_a)
    files_b = set(filelist_b)
    result = sorted(files_a.union(files_b).difference(files_a.intersection(files_b)))
    result = ["export * from './{}'".format(elem.rstrip('.ts')) for elem in result if elem != barrel_name and '.ts' in elem]
    return result 

if __name__ == '__main__':
    barrel_name = 'index.ts'
    source_folder_name = './source'
    folders_to_check = collect_folders(source_folder_name)
    result = {}
    for folder in folders_to_check:
        if 'MIO' not in folder: 
            continue
        folder_file_list = collect_files_from_folder(folder)
        added_files = open_barrel(folder, barrel_name)
        result[folder] = compare_all_to_exported(folder_file_list, added_files, barrel_name)
    print(json.dumps(result, sort_keys=True, indent=2))


