# ameba-web

A sample web application to test and illustrate the functionality of the MI-Server. The main use cases are

- Loading and searching for Dossiers
- Open and display the structure of a Dossier
- Navigating through the Dossier and its Folders
- Loading and displaying the content and metadata of stored Documents.

Business Domain Object model consists of Dossier, Folder, Document, DocumentContent

![RIM]

The index of the application is the Dossier overview screen that is loaded after the User logged in to the application successfully. This
screen presents all existing Dossiers, the User is authorized to access. To search for a particular Dossier a search box on top of the
screen accepts arbitrary search entries. Some menu items are attached on the right hand side. In case of the Dossier
overview a User may reload all existing Dossiers or create and add a new one.

![DossierOverview]

[RIM]: src/main/asciidoc/RIM.png
[DossierOverview]: src/main/asciidoc/DossierOverview.png