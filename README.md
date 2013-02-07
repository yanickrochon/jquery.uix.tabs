jQuery UIx Tabs
===============


New features
------------

Tabs can have option attributes to define their behaviour :

* **data-tab-icon** : set an icon to the tab title. For example "locked" will set the icon `ui-icon-locked`.
* **data-tab-pinned** : enforce that the tab is pinned or not. A pinned tab has a visibility priority.


Options
-------

* **showMore** : *(boolean: false)* Enable or not the "show more" feature
* **showMoreText** : *(string: "Show more")* The text in the "show more" button
* **showMoreIcons** : *(object: { opened: "ui-icon-triangle-1-s", closed: "ui-icon-triangle-1-e" })* The icons to display when opening the "show more" popup
* **showMoreMaxHeight** : *(numeric: null)* Define the max height of the "show more" popup container (set null for auto height)
* **closeable** : *(array: undefined)* Define a list of tab indexes that are closeable
* **pinnable** : *(array: undefined)* Define a list of tab indexes that are pinnable (can toggle the `data-tab-pinned` attribute)
