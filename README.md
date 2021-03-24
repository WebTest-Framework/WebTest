# WebdriverIO Test

Test editor/explorer for automation tests written in describe() and it() structure.

Used and Tested in WebdriverIO and Protractor test frameworks

![Addin View](https://dev.azure.com/subhendushekhargupta/17d5f982-d7a5-4f9b-9486-1ee18cbb8360/_apis/git/repositories/a4af7c88-f5da-4d51-b9fe-bda22c76a45c/items?path=%2Ficons%2FTestViews.PNG&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0 "Addin View")

# Features

## Test Explorer

### General actions
- Configure your project config file mentioned below and get your tests ready
- Click on the edit button which will open the editor to edit the file
- Reload button for tests explorer
### Test type actions
- Icon to add new test to test types with test template
### Spec file actions
- Icon to delete spec file
### Tests actions available
- Test run button

## Test Data Explorer
- Add New Datasheet
- Editing Existing Tests
- Test Data Hub(consolidated view of all tests)(View Only)

## Test Environment Manager
- JSON files with consolidated test environment in below format

```
[
    {
        "PROD": {
            "URL": "https://www.saucedemo.com/",
            "USERNAME": ["standard_user", "locked_out_user"],
            "PASSWORD": ["secret_sauce", "secret_sauce"]
        },{
        "DEV": {
            "URL": "https://www.saucedemo.com/",
            "USERNAME": ["standard_user_dev", "locked_out_user_dev"],
            "PASSWORD": ["secret_sauce", "secret_sauce"]
        }
    }
]
```

- Environment Manager(View Only)

![Addin View](https://dev.azure.com/subhendushekhargupta/17d5f982-d7a5-4f9b-9486-1ee18cbb8360/_apis/git/repositories/a4af7c88-f5da-4d51-b9fe-bda22c76a45c/items?path=%2Ficons%2FEnvManager.PNG&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0 "Addin View")

# Test Explorer

## Test  structure to be followed:

1. Create a `webtest-config.json` file inside project_root/.vscode
2. Copy paste the below code. HERE `tests` IS THE FOLDER IN ROOT WHERE TESTS RESIDES:
    ```
    {
        "TestFolderName": "tests",
        "RunCommandOptions": []
    }
    ```
For more config file options, click [here](#Config-file-options)

2. Create a folder in the root of your project
3. Tests Specs can be stored in below format

    <b><tests_folder_name>/<spec_file>.js</b>

    <b><tests_folder_name>/<test_type_folder>/<spec_file>.js</b>

    <b><tests_folder_name>/<test_type_folder>/<test_sub_type_folder>/<spec_file>.js</b>

    ![Test Structure](https://dev.azure.com/subhendushekhargupta/17d5f982-d7a5-4f9b-9486-1ee18cbb8360/_apis/git/repositories/a4af7c88-f5da-4d51-b9fe-bda22c76a45c/items?path=%2Ficons%2FStructure.PNG&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0 "Test Structure")

3. Click on the icon on the left panel of vscode.
4. Your tests should be loaded there.

## Updating and reloading the tests

Click on the reload button to reload the tests.

## Adding New Tests

1. Click on the `Add Spec` button on folders to add new spec.
2. Enter the `file name` and press enter, `describe name` and press enter, `it name` and press enter. 
Your tests should be created with spec format.
3. Reload the tests explorer to load the test.

## Open Existing Tests

Click on the `Open` button to edit the spec. 
Please note, the file fill be considered as spec if the file extension is `.js`.
If your tests are in typescript files, you can raise an extension request.

## Running Tests

Click on the `Run` button to run the tests.
If your tests have custom commands, you can add them in your `webtest-config.json` file.

## Deleting Spec File

Click on the delete button to delete tests

# Test Data Manager

## Adding new test data

1. Click on the `Add Data` button to add data.
2. Enter file name(`TestData.json`) and press enter.
3. Reload test data manager to load the created data file.

## Open Existing test data

Click on the `Open Data` button to open existing test data.

Deleting test data is out of scope for this release.

## Test Data Hub

Now no need to search in all the files for the test data which you are looking for. We have consolidated all your hard work and given you a consolidated view of your used test data. 

You can search, select and save your test data in your files. Its necessary to have a sub test data folder which will represent your environment folder to access your environment-wise test data files.

# Environment Manager

Lists all the environments available.

Creates a UI view of all the environments available.

Currently, only json files are used to store environment. Please check the environment file format for more details.

## Config file options

<table style="width:100%">
    <thead>
        <tr>
            <td style="width:25%">Option</td>
            <td style="width:10%">Data Type</td>
            <td style="width:75%">Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="width:25%">TestFolderName</td>
            <td style="width:10%">string</td>
            <td style="width:75%">Base test folder in the root of the workspace</td>
        </tr>
        <tr>
            <td style="width:25%">RunCommandOptions</td>
            <td style="width:10%">string array</td>
            <td style="width:75%">If you want to append some other options to the run command, you can append it using this keyword</td>
        </tr>
        <tr>
            <td style="width:25%">Environment</td>
            <td style="width:10%">string</td>
            <td style="width:75%">Your environment path</td>
        </tr>
        <tr>
            <td style="width:25%">TestDataPath</td>
            <td style="width:10%">string</td>
            <td style="width:75%">Your test data folder name</td>
        </tr>
        <tr>
            <td style="width:25%">CurrentSubDataFolder</td>
            <td style="width:10%">string</td>
            <td style="width:75%">Your current sub test data folder name</td>
        </tr>
    </tbody>
</table>