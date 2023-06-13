import csv
from datetime import datetime
import json
import os
import random
import sys

def filter(repetition_dir):
    current_dir = repetition_dir
    files = []

    # Save file names with the extension bpmn.csv
    for file_name in os.listdir(current_dir):
        if file_name.endswith('.bpmn.csv') and 'rifinitura' not in file_name and 'othertasks' not in file_name:
            files.append(file_name)

    # Filter bpmn.csv files to get only the first row and the COLAGGIO rows 
    for file in files:
        with open(os.path.join(current_dir, file), 'r') as input_file, open(os.path.join(current_dir, 'out_'+ file), 'w', newline='') as output_file:
            reader = csv.reader(input_file)
            writer = csv.writer(output_file)

            header = next(reader)
            header.pop(11)
            header.pop(9)
            header.pop(8)
            header.pop(7)
            header.pop(5)
            header.pop(4)
            header.pop(3)
            header.pop(1)
            writer.writerow(header)

            first = next(reader)
            first.pop(11)
            first.pop(9)
            first.pop(8)
            first.pop(7)
            first.pop(5)
            first.pop(4)
            first.pop(3)
            first.pop(1)
            if "2222" in first[2]:                                       # Correction of the dates when needed
                first[2] = first[2].replace("2222", "2022")[0:19]
            first[2] = first[2][0:19]
            first[3] = 0
            writer.writerow(first)

            for row in reader:
                if "COLAGGIO" in row[2]:
                    row.pop(11)
                    row.pop(9)
                    row.pop(8)
                    row.pop(7)
                    row.pop(5)
                    row.pop(4)
                    row.pop(3)
                    row.pop(1)
                    if "2222" in row[2]:
                        row[2] = row[2].replace("2222", "2022")[0:19]
                    row[2] = row[2][0:19]
                    writer.writerow(row)

def aggregate_repetition(repetition_dir):
    current_dir = repetition_dir
    files = []

    for file_name in os.listdir(current_dir):
        if file_name.startswith('out_'):
            files.append(file_name)

    order = {}
    order["objects"] = []
    total_cost_scenario = 0
    total_mould_changes_scenario = 0
    total_production_time_scenario = 0

    for file in files:
        with open(os.path.join(current_dir, file), 'r') as input_file:
            name = file.replace(".bpmn.csv", "").replace("out_", "")
            reader = csv.reader(input_file)
            header = next(reader)
            first = next(reader)
            
            start_time = first[2]

            instances = {}
            objectCost = 0
            for row in reader:
                instances[row[0]] = row[2]
                objectCost += float(row[3])
            
            n_instances = len(instances)

            end_time = instances[str(n_instances-1)]
            start_date = datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
            end_date = datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')
            productionTime = (end_date - start_date).total_seconds()

            # Supposing an initial mould change + a change every 84 + a random number of changes from 1 to 10
            n_mould_changes = 1 + n_instances//84 + random.randint(1, 11)

            object = {
                "objectName" : name,
                "startDate" : start_time,
                "endDate" : end_time,
                "produtionTime" : productionTime,
                "numberInstances" : str(n_instances),
                "instances" : instances,
                "objectCost" : objectCost,
                "numberMouldChanges" : n_mould_changes
            }

            order["objects"].append(object)
            total_cost_scenario += objectCost
            total_mould_changes_scenario += n_mould_changes
            total_production_time_scenario += productionTime

    order["totalCostScenario"] = total_cost_scenario
    order["totalMouldChangesScenario"] = total_mould_changes_scenario
    order["totalProductionTimeScenario"] = total_production_time_scenario

    parent_dir = os.path.dirname(current_dir)
    orchestrator = os.path.join(parent_dir, 'finalOrchestrator.json')

    with open(orchestrator, "r") as orchestrator:
        data = json.load(orchestrator)
        order["orchestator"] = data

    return order

def clean_output_files(repetition_dir):
    current_dir = repetition_dir

    for file_name in os.listdir(current_dir):
        if file_name.startswith('out_'):
            file_path = os.path.join(current_dir, file_name)
            os.remove(file_path)

def total_aggregation_scenario(scenario_dir, output_directory):
    current_directory = scenario_dir

    minMouldChanges = 0
    objects = {}
    totalCostScenarios = 0
    totalTimeScenarios = 0
    orchestrator = {}

    # Iterate over child directories in the current directory
    for repetition_dir in os.scandir(current_directory):
        if repetition_dir.is_dir() and repetition_dir.name[-1].isdigit():
            print(f"    Processing {repetition_dir.name}...")
            filter(repetition_dir)
            repetition = aggregate_repetition(repetition_dir)
            if minMouldChanges == 0 or repetition["totalMouldChangesScenario"] < minMouldChanges:
                objects = repetition["objects"]
                orchestrator = repetition["orchestator"]
                minMouldChanges = repetition["totalMouldChangesScenario"]
            totalCostScenarios += repetition["totalCostScenario"]
            totalTimeScenarios += repetition["totalProductionTimeScenario"]
            clean_output_files(repetition_dir)

    avgTotalCost = totalCostScenarios / 10
    avgTotalTime = totalTimeScenarios / 10

    scenario = {
        "objects" : objects,
        "orchestator" : orchestrator,
        "totalCostScenario" : avgTotalCost,
        "totalProductionTimeScenario" : avgTotalTime,
        "totalMouldChangesScenario" : minMouldChanges
    }

    out_scenario = os.path.join(output_directory,"scenario"+ str(int(current_directory.name[-1])+1) +".json")

    # Open file in write mode and convert the dictionary to a JSON string to write in it
    with open(out_scenario, "w") as output:
        json.dump(scenario, output)


if __name__ == '__main__':
    current_directory = sys.argv[1]    # Pass the directory as string
    output_directory = sys.argv[2]     # Pass the directory as string

    for scenario_dir in os.scandir(current_directory):
            if scenario_dir.is_dir() and scenario_dir.name[-1].isdigit():
                print(f"Processing {scenario_dir.name}...")
                total_aggregation_scenario(scenario_dir, output_directory)
                print()

    print("------------------")
    print("End of Processing.")
    print("------------------")