document.addEventListener("DOMContentLoaded", () => {
    let apiUrl = "https://gorest.co.in/public-api/users";
    let api = apiUrl;
    const userList = document.getElementById("user-list");
    const userFormContainer = document.getElementById("user-form-container");
    const userForm = document.getElementById("user-form");
    const newUserButton = document.getElementById("new-user-button");
    const accessToken = 'e07faa94fc66d1bf3302f7475c08b6e8e9d6fa7353fbe13bf43ee7eb9bd285d7';
    let pageNumber = 1;
    let totalPages;
    const headers = new Headers({
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
    });
    let sno = 1;
    
    // Function to fetch and display users
    const fetchUsers = () => {
        apiUrl = api;
        apiUrl = `${apiUrl}?page=${pageNumber}`;
        console.log('api: ',apiUrl);
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log('user data:',data);
                totalPages = data.meta.pagination.pages;
                console.log('total pages:',totalPages);
                userList.innerHTML = "";
                const listItem = document.createElement("div");
                const row = document.createElement("tr");
                listItem.innerHTML = `
                <div style="display:flex;justify-content: space-between;font-weight:600;">
                <div>S.No.</div>
                <div style="padding-right: 90px;">Name</div>
                <div style="padding-right: 60px;">Actions</div>
                </div>                      
                `;
                userList.appendChild(listItem);
                data.data.forEach(user => {
                    const listItem = document.createElement("div");
                    const row = document.createElement("tr");
                    listItem.innerHTML = `
                    <div style="display:flex;justify-content: space-between;">
                    <div>${sno++}</div>
                    <div>${user.name}</div>
                    <div>
                    <span class="actions details-button" data-id="${user.id}">Show</span>
                    <span class="actions edit-button" data-id="${user.id}">Edit</span>&nbsp&nbsp&nbsp&nbsp&nbsp
                    <span class="actions delete-button" data-id="${user.id}">Delete</span>
                    </div>
                    </div>                      
                    `;
                    userList.appendChild(listItem);

                    // Attach event listeners for details, edit, and delete buttons
                    const detailsButton = listItem.querySelector(".details-button");
                    const editButton = listItem.querySelector(".edit-button");
                    const deleteButton = listItem.querySelector(".delete-button");
                    const currentPageSpan = document.getElementById("current-page");
                    currentPageSpan.textContent = `Page ${pageNumber}`;

                    detailsButton.addEventListener("click", () => showUserDetails(user.id));
                    editButton.addEventListener("click", () => editUser(user.id));
                    deleteButton.addEventListener("click", () => deleteUser(user.id));
                });
            })
            .catch(error => console.error("Error fetching users:", error));
    };

    // Function to display user details
    const showUserDetails = (userId) => {
       
        fetch(`${api}/${userId}`)
            .then(response => response.json())
            .then(user => {
                // Display user details in a modal or a separate section
                alert(`User Details:\nName: ${user.data.name}\nEmail: ${user.data.email}\nGender: ${user.data.gender}\nStatus: ${user.data.status}`);
            })
            .catch(error => console.error("Error fetching user details:", error));
    };

    // Function to open the user form for editing
    const editUser = (userId) => {
        fetch(`${api}/${userId}`,{
            headers: headers
        })
            .then(response => response.json())
            .then(user => {

                // Populate the user form fields with user data for editing
                userForm.elements["name"].value = user.data.name;
                userForm.elements["email"].value = user.data.email;
                userForm.elements["gender"].value = user.data.gender;
                userForm.elements["status"].checked = user.data.status === "active"; // Assuming "active" means checked
                userForm.elements["user-id"].value = userId;
                console.log('user ID:',userId);
                // Display the user form
                userFormContainer.style.display = "block";
            })
            .catch(error => console.error("Error fetching user details:", error));
    };

    // Function to delete a user
    const deleteUser = (userId) => {
        if (confirm("Are you sure you want to delete this user?")) {
            fetch(`${api}/${userId}`, {
                method: "DELETE",
                headers: headers,
            })
                .then(response => {
                    console.log('delete reaponse:', response.status);
                    if (response.status === 200) {
                        alert("User deleted successfully.");
                        fetchUsers(); // Refresh the user list
                    } else {
                        alert("Failed to delete user.");
                    }
                })
                .catch(error => console.error("Error deleting user:", error));
        }
    };

    // Function to handle form submission for creating/editing users
    userForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log('submit buttn called');
        const name = userForm.elements["name"].value;
        const email = userForm.elements["email"].value;
        const gender = userForm.elements["gender"].value;
        const status = userForm.elements["status"].checked ? "active" : "inactive";
        const userId = userForm.elements["user-id"].value;

        const userData = {
            name,
            email,
            gender,
            status,
        };

        console.log('user data:', userData);
        console.log('user id:', userId);
        if (userId) {
            // Editing an existing user
            fetch(`${api}/${userId}`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(userData),
            })
                .then(response => {
                    console.log('response:', response);
                    if (response.status === 200) {
                        alert("User updated successfully.");
                        userForm.reset();
                        userFormContainer.style.display = "none";
                        fetchUsers(); // Refresh the user list
                    } else {
                        alert("Failed to update user.");
                    }
                })
                .catch(error => console.error("Error updating user:", error));
        } else {
            // Creating a new user
            console.log('userdataa:',userData);
          
            fetch(api,{
                method: "POST",
                headers: headers,
                body: JSON.stringify(userData),
            })
                .then(data => {
                    console.log('data:',data);
                    if (data.status === 200) {
                        alert("User created successfully.");
                        userForm.reset();
                        userFormContainer.style.display = "none";
                        fetchUsers(); // Refresh the user list
                    } else {
                        alert("Failed to create user.");
                    }
                })
                .catch(error => console.error("Error creating user:", error));
        }
    });

    // Event listener for the "New User" button
    newUserButton.addEventListener("click", () => {
        userForm.reset();
        userFormContainer.style.display = "block";
        userForm.elements["user-id"].value = ""; // Clear the user ID field to indicate a new user
    });

    // Initial fetch of users
    fetchUsers();

        const itemsPerPage = 5; // Number of items to display per page
        const userItems = Array.from(userList.getElementsByClassName("user-list-item")); // Get all user items
        console.log('user list:', userList);
        console.log('user items :', userItems);
        const paginationContainer = document.getElementById("pagination");
        const prevPageButton = document.getElementById("prev-page");
        const nextPageButton = document.getElementById("next-page");
  
        nextPageButton.addEventListener("click", () => {
            if(pageNumber<totalPages)
             pageNumber++;
             console.log('page :',pageNumber);
            fetchUsers(pageNumber);
        });
    
        // Event listener for "Previous" button
        prevPageButton.addEventListener("click", () => {
            if(pageNumber>1){
                pageNumber--;
                fetchUsers(pageNumber);

            }
        });
        
    });
    
