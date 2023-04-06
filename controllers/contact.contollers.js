const { runQuery, connection, getCriteria_helper, sendResponse, hasDuplicate } = require("../helpers/common.helper");
const { insertPhoneNos_helper, checkForDuplicateNo, searchContact, deletePhoneNos_helper } = require("../helpers/contact.helpers.");


const createNewContact_controller = async (req, res) => {
    try{
        let myObj = getCriteria_helper(req);
        let { phonenos, username  } = myObj
        if(phonenos === [] || !username){
       res.json(sendResponse(1001, "Username or Phone No not enterded please check all required fields", {}));
        return;
        }
    delete myObj.phonenos;
    if(hasDuplicate(phonenos)){
        res.json(sendResponse({}, "Duplicate Phone numbers not allowed for the particular contact", 55555));
        return;
    }


    
    const sql = `INSERT INTO userdata SET ?`;
    const result = await runQuery(sql, [myObj], connection);
    insertPhoneNos_helper(phonenos, result.insertId, connection)
    res.json(sendResponse({}, "Contact Saved Successfuly"));
    return;
}catch(err){
    res.json(sendResponse({}, "Something went Wrong " + err.message, 999999));
}
}

const getAllContact_controller = async (req, res) => {
  try {
    const sql = `   SELECT ud.id, ud.username, ud.work, gd.name as groupname, ud.country, ud.place
                    FROM userdata ud
                    LEFT JOIN groupdetails gd ON ud.groupid = gd.id
                    WHERE ud.isdeleted = 0 `;
    const result = await runQuery(sql, [], connection);
    const query = ` SELECT ud.id, uc.contactno FROM userdata ud
                    LEFT JOIN usercontactnos uc ON ud.id = uc.userid
                    WHERE uc.isdeleted = 0`;
    const data = await runQuery(query, [], connection);
    result.forEach((item) => {
      let phonenos = [];
      data.forEach((i) => {
        if (item.id === i.id) {
          phonenos.push(i.contactno);
        }
        item.phonenos = phonenos;
      });
    });
    // console.log(result);
    res.json(sendResponse(result, "Success"));
  } catch (err) {
    res.json(sendResponse({}, err.message, 999999));
  }
};

const deleteContact_controller = async (req, res) => {
try{
    let  { delArr } = getCriteria_helper(req);
    const sql =`UPDATE userdata SET isdeleted =1 
                WHERE id IN (?)`;
    await runQuery(sql, [delArr], connection);
    res.json(sendResponse({}, "Contact Deleted"))

}catch(err){
    res.json(sendResponse({}, err.message, 99999));
}
}


const updateContact_controller = async (req, res) => {
    try{
        const myObj = getCriteria_helper(req);
        const { phonenos, id, delarr } = myObj;
        delete myObj.id;
        delete myObj.phonenos;
        delete myObj.delarr
        let data = await checkForDuplicateNo(phonenos, id, connection)
        if(data.length !== 0) {
            res.json(sendResponse({}, "Duplicate Phone numbers not allowed for the particular contact", 55555))
            return;
        }
        const sql = `UPDATE userdata  SET ?
                        WHERE id = ?`;
        await runQuery(sql, [myObj, id], connection);
        insertPhoneNos_helper(phonenos, id, connection)
        deletePhoneNos_helper(delarr, connection)
        res.json(sendResponse({}, " Contact Updated"))
    }catch(err){
        res.json(sendResponse({}, err.message, 999999))
    }
}


const serchForaContact_controller = async (req, res) => {
  try {
    let { squery } = getCriteria_helper(req);
    const sql = `   SELECT ud.id, ud.username, ud.work, gd.name as groupname, ud.country, ud.place
        FROM userdata ud
        LEFT JOIN groupdetails gd ON ud.groupid = gd.id
        WHERE ud.isdeleted = 0 `;
    const result = await runQuery(sql, [], connection);
    const query = ` SELECT ud.id, uc.contactno FROM userdata ud
        LEFT JOIN usercontactnos uc ON ud.id = uc.userid
        WHERE uc.isdeleted = 0`;
    const data = await runQuery(query, [], connection);
    result.forEach((item) => {
      let phonenos = [];
      data.forEach((i) => {
        if (item.id === i.id) {
          phonenos.push(i.contactno);
        }
        item.phonenos = phonenos;
      });
    });
   const filteredData =  searchContact(squery, result);
   res.json(sendResponse(filteredData, "Success"));
   return;
  } catch (err) {
    res.json(sendResponse({}, err.message, 99999))
  }
};
module.exports = {
    createNewContact_controller,
    getAllContact_controller,
    deleteContact_controller,
    updateContact_controller,
    serchForaContact_controller

}