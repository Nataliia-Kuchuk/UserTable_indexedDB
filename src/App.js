
import { useEffect, useState } from 'react';
import './App.css';

const idb = window.indexedDB;

const createCollectionsIndexedDB = () => {
  if (!idb) {
    console.log('This browser doesn`t support IndexedDB')
    return
  }
  console.log(idb)
  const request = idb.open('test-db', 2);
 
  request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("userData")) {
      db.createObjectStore("userData", {
        keyPath: "id"
      });
    }

  };
  request.onsuccess = () => {
    console.log('DataBase opened succesfully')
  }
  request.onerror = (event) => {
    console.log(event, "error occured with IndexedDB");
  };
};

const App = () => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [allUsersData, setAllUsersData] = useState([]);
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  useEffect(() => {
    createCollectionsIndexedDB();
    getAllData();
  }, []);

  const getAllData = () => {
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readonly");
      const userData = tx.objectStore("userData");
      const users = userData.getAll();
      // const users = userData.get(selectedUser.id)
      users.onsuccess = (query) => {
        setAllUsersData(query.srcElement.result);
      };
      users.onerror = (query) => {
        alert("Error occured while loading initial data.");
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const handleSubmit = (event) => {
    const dbPromise = idb.open("test-db", 2);
    if (firstName && lastName && email) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const tx = db.transaction("userData", "readwrite");
        const userData = tx.objectStore("userData");
        if (addUser) {
          const users = userData.put({
            id: allUsersData?.length + 1,
            firstName,
            lastName,
            email,
          });
          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            };
            getAllData();

            alert("User added");
          };
          users.onerror = (event) => {
            console.log(event);
            alert("Error");
          };
        } else {
          const users = userData.put({
            id: selectedUser?.id,
            firstName,
            lastName,
            email,
          });
          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            };
            getAllData();

            alert("User updated");
          };
          users.onerror = (event) => {
            console.log(event);
            alert("Error");
          };
        }
      };
    }
  };
  console.log(allUsersData);

  const deleteUserHandler = (user) => {
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readwrite");
      const userData = tx.objectStore("userData");
      const deletedUser = userData.delete(user?.id);
      // const users = userData.get(selectedUser.id)
      deletedUser.onsuccess = (query) => {
        alert("User deleted");
        getAllData();
      };
      deletedUser.onerror = (query) => {
        alert("Error occured while loading initial data.");
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };
  return (
    <div className="row" style={{ padding: 100 }}>
      <div className="col-md-6">
        <button
          className="btn btn-primary float-end mb-2"
          onClick={() => {
            setAddUser(true);
            setEditUser(false);
            setSelectedUser({});
            setFirstName("");
            setLastName("");
            setEmail("");
          }}
        >
          Add
        </button>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsersData.map((row) => (
              <tr key={row?.id}>
                <td>{row?.firstName}</td>
                <td>{row?.lastName}</td>
                <td>{row?.email}</td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setAddUser(false);
                      setEditUser(true);
                      setSelectedUser(row);
                      setFirstName(row?.firstName);
                      setLastName(row?.lastName);
                      setEmail(row?.email);
                    }}
                    style={{marginRight: 5}}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      deleteUserHandler(row);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-md-6">
        {addUser || editUser ? (
          <div className="card" style={{ padding: "20px" }}>
            <h3>{editUser ? "Update User" : "Add User"}</h3>
            <div className="form-group">
              <label htmlFor="">First Name</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <button className="btn btn-primary mt-2" onClick={handleSubmit}>
                {editUser ? "Update" : "Add"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  
}

export default App;

