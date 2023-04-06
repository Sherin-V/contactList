const { runQuery } = require("./common.helper");

const insertPhoneNos_helper = (phonenos = [], userid, connection) => {
    
    const sql = `   INSERT INTO usercontactnos SET  ?`;
    phonenos.forEach(async (contactno)=>{
        let obj =  {userid, contactno}
       
        await runQuery(sql, [obj], connection);
    })
    return
    
}
const deletePhoneNos_helper = async (ids, connection) => {
  const sql = `UPDATE usercontactnos SET 
                              isdeleted = 1
                WHERE id IN (?)`;
   await runQuery(sql, [ids], connection);
   return;

}

const checkForDuplicateNo = async (phonenos, userid, connection) => {
const sql = `   SELECT id FROM usercontactnos
                WHERE contactno IN (?)
                AND userid = ?`
    const data =  await runQuery(sql, [phonenos, userid], connection) 
    return data;
}

const searchContact_old = (query, contacts) => {
    return contacts.filter(contact =>
      contact.username.toLowerCase().includes(query.toLowerCase()) ||
      (Array.isArray(query.phonenos) && query.phonenos.includes(contact.phonenos))
    );
  }

  function searchContact_old1(searchQuery, contacts ) {
    // Determine whether searchQuery is a string or an array
    const isPhoneNoArray = Array.isArray(searchQuery) && searchQuery.every(no => typeof no === 'number');
    const isUsernameString = typeof searchQuery === 'string';
  
    if (isPhoneNoArray) {
      // Search by phone numbers
      return contacts.filter(contact => 
        {searchQuery.includes(contact.phonenos[0])
        });
    } else if (isUsernameString) {
      // Search by username
      return contacts.filter(contact => contact.username.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      // Invalid search query
      throw new Error('Invalid search query');
    }
  }
  
  function searchContact(searchQuery, contacts) {
    let results = [];
  
    if (typeof searchQuery === "string") {
      // search by username
      results = contacts.filter(
        (contact) =>
          contact.username.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1
      );
    } else if (
      Array.isArray(searchQuery) &&
      searchQuery.every((num) => typeof num === "number")
    ) {
      // search by array of phone numbers
      results = contacts.filter((contact) =>
        contact.phonenos.some((number) => searchQuery.includes(number))
      );
    } else {
      throw new Error("Invalid search query");
    }
  
    return results;
  }
  

module.exports = {
    insertPhoneNos_helper,
    checkForDuplicateNo,
    searchContact,
    deletePhoneNos_helper
}